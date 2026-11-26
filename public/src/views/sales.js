import { createAppLayout } from '../components/app-layout.js';

import {
  createSale,
  getSales
} from '../services/sales-service.js';

import {
  getProducts
} from '../services/inventory-service.js';

import { getBusinessConfig } from '../services/pricing-service.js';


export default function salesView() {

  const container =
    document.createElement('div');

  container.className =
    'sales-container';


  let products = [];
  let config = null;

  let cart = [];

  let sales = [];


  /*
  |--------------------------------------------------------------------------
  | FORMATEAR DINERO
  |--------------------------------------------------------------------------
  */

  const formatCurrency =
    (value) => {

      return new Intl.NumberFormat(
        'es-AR',
        {
          style: 'currency',
          currency: 'ARS'
        }
      ).format(
        Number(value) || 0
      );

    };


  /*
  |--------------------------------------------------------------------------
  | RENDER PRINCIPAL
  |--------------------------------------------------------------------------
  */

  const render = async () => {

    container.innerHTML =
      '<p>Cargando ventas...</p>';


    try {

      products =
        await getProducts();


      sales =
        await getSales();


      container.innerHTML = `

        <div class="sales-header">

          <div>

            <h1>
              🛒 Ventas
            </h1>

            <p>
              Registra tus ventas y controla tu inventario.
            </p>

          </div>

        </div>


        <div class="sales-layout">


          <!-- PRODUCTOS -->

          <section
            class="sales-products-panel"
          >

            <h2>
              Productos disponibles
            </h2>


            <div
              id="sales-products-list"
              class="sales-products-list"
            ></div>

          </section>



          <!-- CARRITO -->

          <section
            class="sales-cart-panel"
          >

            <h2>
              Nueva venta
            </h2>


            <div
              id="sales-cart"
              class="sales-cart"
            ></div>


            <div
              class="sales-total"
            >

              <span>
                Total
              </span>

              <strong
                id="sales-total"
              >
                ${formatCurrency(0)}
              </strong>

            </div>


            <button
              id="complete-sale-btn"
              class="complete-sale-btn"
            >

              Confirmar venta

            </button>


            <div
              id="sales-message"
              class="sales-message"
            ></div>

          </section>


        </div>



        <!-- HISTORIAL -->

        <section
          class="sales-history"
        >

          <h2>
            Historial de ventas
          </h2>


          <div
            id="sales-history-list"
          ></div>

        </section>

      `;


      renderProducts();

      renderCart();

      renderSalesHistory();

      attachEvents();


    } catch (
      error
    ) {

      console.error(
        'Error cargando ventas:',
        error
      );


      container.innerHTML = `

        <p>

          Error al cargar las ventas:

          ${error.message}

        </p>

      `;

    }

  };


  /*
  |--------------------------------------------------------------------------
  | RENDER PRODUCTOS
  |--------------------------------------------------------------------------
  */

  const renderProducts = () => {

    const productsList =
      container.querySelector(
        '#sales-products-list'
      );


    if (
      !productsList
    ) {
      return;
    }


    const availableProducts =
      products.filter(
        product =>

          product.active !== false &&

          Number(
            product.stock
          ) > 0
      );


    if (
      availableProducts.length === 0
    ) {

      productsList.innerHTML = `

        <p>

          No hay productos
          disponibles.

        </p>

      `;

      return;

    }


    productsList.innerHTML =
      availableProducts.map(
        product => `

          <div
            class="sales-product-card"
          >


            ${
              product.imageURL

                ? `

                  <img
                    src="${product.imageURL}"
                    alt="${product.name}"
                    class="sales-product-image"
                  />

                `

                : `

                  <div
                    class="sales-product-image-placeholder"
                  >
                    📦
                  </div>

                `
            }


            <div
              class="sales-product-info"
            >

              <h3>

                ${product.name}

              </h3>


              <p>

                Stock:

                ${product.stock}

              </p>


              <strong>

                ${formatCurrency(
                  product.price
                )}

              </strong>


            </div>


            <button
              class="add-to-sale-btn"
              data-product-id="${product.id}"
            >

              Agregar

            </button>


          </div>

        `
      ).join('');

  };


  /*
  |--------------------------------------------------------------------------
  | AGREGAR AL CARRITO
  |--------------------------------------------------------------------------
  */

  const addToCart =
    (productId) => {

      const product =
        products.find(
          item =>
            item.id ===
            productId
        );


      if (
        !product
      ) {
        return;
      }


      const existingItem =
        cart.find(
          item =>
            item.productId ===
            productId
        );


      /*
      |--------------------------------------------------------------------------
      | SI YA ESTÁ EN EL CARRITO
      |--------------------------------------------------------------------------
      */

      if (
        existingItem
      ) {

        if (
          existingItem.quantity >=
          Number(product.stock)
        ) {

          showMessage(
            'No hay más stock disponible.',
            'error'
          );

          return;

        }


        existingItem.quantity += 1;


      } else {


        cart.push({

          productId:

            product.id,

          name:

            product.name,

          quantity:

            1,

          price:

            Number(
              product.price
            ) || 0,

          stock:

            Number(
              product.stock
            ) || 0

        });

      }


      renderCart();

    };


  /*
  |--------------------------------------------------------------------------
  | RENDER CARRITO
  |--------------------------------------------------------------------------
  */

  const renderCart =
    () => {

      const cartElement =
        container.querySelector(
          '#sales-cart'
        );


      if (
        !cartElement
      ) {
        return;
      }


      if (
        cart.length === 0
      ) {

        cartElement.innerHTML = `

          <p
            class="empty-cart"
          >

            Todavía no agregaste
            productos.

          </p>

        `;


        updateTotal();

        return;

      }


      cartElement.innerHTML =
        cart.map(
          item => `

            <div
              class="sales-cart-item"
            >

              <div>

                <strong>

                  ${item.name}

                </strong>


                <p>

                  ${formatCurrency(
                    item.price
                  )}

                </p>

              </div>


              <div
                class="cart-quantity"
              >

                <button
                  class="decrease-quantity-btn"
                  data-product-id="${item.productId}"
                >
                  −
                </button>


                <span>

                  ${item.quantity}

                </span>


                <button
                  class="increase-quantity-btn"
                  data-product-id="${item.productId}"
                >
                  +
                </button>

              </div>


              <strong>

                ${formatCurrency(
                  item.price *
                  item.quantity
                )}

              </strong>


              <button
                class="remove-cart-item-btn"
                data-product-id="${item.productId}"
              >
                ✕
              </button>


            </div>

          `
        ).join('');


      updateTotal();

    };


  /*
  |--------------------------------------------------------------------------
  | ACTUALIZAR TOTAL
  |--------------------------------------------------------------------------
  */

  const updateTotal =
    () => {

      const totalElement =
        container.querySelector(
          '#sales-total'
        );


      if (
        !totalElement
      ) {
        return;
      }


      const total =
        cart.reduce(
          (
            accumulator,
            item
          ) =>

            accumulator +
            (
              item.price *
              item.quantity
            ),

          0
        );


      totalElement.textContent =
        formatCurrency(
          total
        );

    };


  /*
  |--------------------------------------------------------------------------
  | HISTORIAL
  |--------------------------------------------------------------------------
  */

  const renderSalesHistory =
    () => {

      const historyElement =
        container.querySelector(
          '#sales-history-list'
        );


      if (
        !historyElement
      ) {
        return;
      }


      if (
        sales.length === 0
      ) {

        historyElement.innerHTML = `

          <p>

            Todavía no hay ventas
            registradas.

          </p>

        `;

        return;

      }


      historyElement.innerHTML =
        sales.map(
          sale => {

            const date =
              sale.createdAt?.toDate
                ? sale.createdAt.toDate()
                : null;


            return `

              <div
                class="sale-history-item"
              >

                <div>

                  <strong>

                    Venta

                  </strong>


                  <p>

                    ${
                      date

                        ? date.toLocaleString(
                            'es-AR'
                          )

                        : 'Fecha pendiente'
                    }

                  </p>

                </div>


                <div>

                  <p>

                    Ganancia:

                    ${formatCurrency(
                      sale.profit
                    )}

                  </p>


                  <strong>

                    ${formatCurrency(
                      sale.total
                    )}

                  </strong>

                </div>


              </div>

            `;

          }
        ).join('');

    };


  /*
  |--------------------------------------------------------------------------
  | MENSAJES
  |--------------------------------------------------------------------------
  */

  const showMessage =
    (
      message,
      type = 'success'
    ) => {

      const messageElement =
        container.querySelector(
          '#sales-message'
        );


      if (
        !messageElement
      ) {
        return;
      }


      messageElement.textContent =
        message;


      messageElement.className =
        `sales-message ${type}`;

    };


  /*
  |--------------------------------------------------------------------------
  | EVENTOS
  |--------------------------------------------------------------------------
  */

  const attachEvents =
    () => {


      /*
      | Agregar producto
      */

      const addButtons =
        container.querySelectorAll(
          '.add-to-sale-btn'
        );


      addButtons.forEach(
        button => {

          button.addEventListener(
            'click',
            () => {

              addToCart(
                button.dataset.productId
              );

            }
          );

        }
      );


      /*
      | Aumentar cantidad
      */

      container
        .querySelectorAll(
          '.increase-quantity-btn'
        )
        .forEach(
          button => {

            button.addEventListener(
              'click',
              () => {

                const item =
                  cart.find(
                    cartItem =>

                      cartItem.productId ===
                      button.dataset.productId
                  );


                if (
                  !item
                ) {
                  return;
                }


                if (
                  item.quantity >=
                  item.stock
                ) {

                  showMessage(
                    'No hay más stock disponible.',
                    'error'
                  );

                  return;

                }


                item.quantity += 1;


                renderCart();

                attachEvents();

              }
            );

          }
        );


      /*
      | Disminuir cantidad
      */

      container
        .querySelectorAll(
          '.decrease-quantity-btn'
        )
        .forEach(
          button => {

            button.addEventListener(
              'click',
              () => {

                const item =
                  cart.find(
                    cartItem =>

                      cartItem.productId ===
                      button.dataset.productId
                  );


                if (
                  !item
                ) {
                  return;
                }


                if (
                  item.quantity <= 1
                ) {

                  cart =
                    cart.filter(
                      cartItem =>

                        cartItem.productId !==
                        item.productId
                    );


                } else {

                  item.quantity -= 1;

                }


                renderCart();

                attachEvents();

              }
            );

          }
        );


      /*
      | Eliminar producto
      */

      container
        .querySelectorAll(
          '.remove-cart-item-btn'
        )
        .forEach(
          button => {

            button.addEventListener(
              'click',
              () => {

                cart =
                  cart.filter(
                    item =>

                      item.productId !==
                      button.dataset.productId
                  );


                renderCart();

                attachEvents();

              }
            );

          }
        );


      /*
      | Confirmar venta
      */

      const completeButton =
        container.querySelector(
          '#complete-sale-btn'
        );


      completeButton.addEventListener(
        'click',
        async () => {

          if (
            cart.length === 0
          ) {

            showMessage(
              'Agrega al menos un producto.',
              'error'
            );

            return;

          }


          try {

            completeButton.disabled =
              true;


            completeButton.textContent =
              'Procesando...';


            const saleProducts =
              cart.map(
                item => ({

                  productId:

                    item.productId,

                  quantity:

                    item.quantity

                })
              );


            await createSale(
              saleProducts
            );


            showMessage(
              'Venta registrada correctamente.',
              'success'
            );


            cart = [];


            products =
              await getProducts();


            sales =
              await getSales();


            renderProducts();

            renderCart();

            renderSalesHistory();

            attachEvents();


          } catch (
            error
          ) {

            console.error(
              'Error creando venta:',
              error
            );


            showMessage(
              error.message ||
              'Error al registrar la venta.',
              'error'
            );


          } finally {

            completeButton.disabled =
              false;


            completeButton.textContent =
              'Confirmar venta';

          }

        }
      );

    };


  /*
  |--------------------------------------------------------------------------
  | INICIALIZAR
  |--------------------------------------------------------------------------
  */

  render();


  const layout =
    createAppLayout(
      container,
      '#sales'
    );


  const destroy =
    () => {


      /*
      | Aquí podremos cancelar
      | listeners en el futuro.
      */

    };


  return {

    render,

    destroy,

    element:
      layout.element

  };

}