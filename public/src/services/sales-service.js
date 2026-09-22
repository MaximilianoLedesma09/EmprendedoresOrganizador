import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  doc,
  runTransaction
} from 'firebase/firestore';

import { db, auth } from './firebase-init.js';

const SALES_COLLECTION = 'sales';
const PRODUCTS_COLLECTION = 'products';


/*
|--------------------------------------------------------------------------
| OBTENER USUARIO
|--------------------------------------------------------------------------
*/

const getCurrentUser = () => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error('Usuario no autenticado.');
  }

  return user;
};


/*
|--------------------------------------------------------------------------
| OBTENER COLECCIÓN DE VENTAS
|--------------------------------------------------------------------------
*/

const getSalesCollection = () => {
  const user = getCurrentUser();

  return collection(
    db,
    'users',
    user.uid,
    SALES_COLLECTION
  );
};


/*
|--------------------------------------------------------------------------
| CREAR VENTA
|--------------------------------------------------------------------------
|
| Esta función:
|
| 1. Verifica el stock.
| 2. Descuenta el stock.
| 3. Guarda la venta.
| 4. Calcula costo.
| 5. Calcula ganancia.
|
| Todo ocurre dentro de una transacción.
|
*/

export const createSale = async (saleProducts) => {

  const user = getCurrentUser();

  if (!Array.isArray(saleProducts) || saleProducts.length === 0) {
    throw new Error(
      'Debes agregar al menos un producto a la venta.'
    );
  }


  const saleResult = await runTransaction(
    db,
    async (transaction) => {

      const processedProducts = [];

      let total = 0;
      let totalCost = 0;


      /*
      |--------------------------------------------------------------------------
      | RECORRER PRODUCTOS
      |--------------------------------------------------------------------------
      */

      for (const saleItem of saleProducts) {

        const productRef = doc(
          db,
          'users',
          user.uid,
          PRODUCTS_COLLECTION,
          saleItem.productId
        );


        const productSnapshot =
          await transaction.get(productRef);


        if (!productSnapshot.exists()) {
          throw new Error(
            `El producto seleccionado ya no existe.`
          );
        }


        const product =
          productSnapshot.data();


        const quantity =
          Number(saleItem.quantity);


        if (
          !quantity ||
          quantity <= 0
        ) {
          throw new Error(
            `Cantidad inválida para ${product.name}.`
          );
        }


        /*
        |--------------------------------------------------------------------------
        | VALIDAR STOCK
        |--------------------------------------------------------------------------
        */

        if (
          Number(product.stock) <
          quantity
        ) {
          throw new Error(
            `Stock insuficiente para "${product.name}". Stock disponible: ${product.stock}`
          );
        }


        const unitPrice =
          Number(product.price) || 0;


        const unitCost =
          Number(product.cost) || 0;


        const subtotal =
          unitPrice * quantity;


        const subtotalCost =
          unitCost * quantity;


        /*
        |--------------------------------------------------------------------------
        | DESCONTAR STOCK
        |--------------------------------------------------------------------------
        */

        const newStock =
          Number(product.stock) -
          quantity;


        transaction.update(
          productRef,
          {
            stock: newStock,
            updatedAt: serverTimestamp()
          }
        );


        /*
        |--------------------------------------------------------------------------
        | GUARDAR PRODUCTO PROCESADO
        |--------------------------------------------------------------------------
        */

        processedProducts.push({

          productId:
            productSnapshot.id,

          name:
            product.name,

          quantity,

          unitPrice,

          unitCost,

          subtotal,

          subtotalCost

        });


        total += subtotal;

        totalCost += subtotalCost;
      }


      /*
      |--------------------------------------------------------------------------
      | CALCULAR GANANCIA
      |--------------------------------------------------------------------------
      */

      const profit =
        total -
        totalCost;


      /*
      |--------------------------------------------------------------------------
      | CREAR DOCUMENTO DE VENTA
      |--------------------------------------------------------------------------
      */

      const salesCollection =
        getSalesCollection();


      const saleRef =
        doc(salesCollection);


      transaction.set(
        saleRef,
        {

          products:
            processedProducts,

          total,

          totalCost,

          profit,

          createdAt:
            serverTimestamp()

        }
      );


      return {

        id:
          saleRef.id,

        products:
          processedProducts,

        total,

        totalCost,

        profit

      };

    }
  );


  return saleResult;
};


/*
|--------------------------------------------------------------------------
| OBTENER VENTAS
|--------------------------------------------------------------------------
*/

export const getSales = async () => {

  const salesCollection =
    getSalesCollection();


  const salesQuery =
    query(
      salesCollection,
      orderBy(
        'createdAt',
        'desc'
      )
    );


  const snapshot =
    await getDocs(
      salesQuery
    );


  return snapshot.docs.map(
    document => ({

      id:
        document.id,

      ...document.data()

    })
  );
};