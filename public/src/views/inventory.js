import { createAppLayout } from '../components/app-layout.js';

import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
} from '../services/inventory-service.js';

import { getBusinessConfig } from '../services/pricing-service.js';


export default function inventoryView() {

  const container =
    document.createElement('div');

  container.className =
    'inventory-container';


  let products = [];
  let config = null;

  let currentFilter = 'all';

  let searchTerm = '';

  let editingProductId = null;


  /*
   * ========================================================
   * UTILIDADES
   * ========================================================
   */

  const formatCurrency = (value) => {

    return new Intl.NumberFormat(
      'es-AR',
      {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }
    ).format(
      Number(value) || 0
    );

  };


  const escapeHtml = (value) => {

    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');

  };


  /*
   * ========================================================
   * ESTADO DEL STOCK
   * ========================================================
   */

  const getStockStatus = (product) => {

    const stock =
      Number(product.stock) || 0;

    const minStock =
      Number(product.minStock) || 0;


    if (stock <= 0) {

      return {
        key: 'out',
        label: 'Sin stock'
      };

    }


    if (stock <= minStock) {

      return {
        key: 'low',
        label: 'Stock bajo'
      };

    }


    return {
      key: 'available',
      label: 'Disponible'
    };

  };


  /*
   * ========================================================
   * MARGEN
   * ========================================================
   */

  const calculateMargin = (product) => {

    const cost =
      Number(product.cost) || 0;

    const price =
      Number(product.price) || 0;


    if (price <= 0) {
      return 0;
    }


    return (
      ((price - cost) / price) * 100
    );

  };


  /*
   * ========================================================
   * FILTRADO
   * ========================================================
   */

  const getFilteredProducts = () => {

    return products.filter(
      product => {

        const name =
          product.name?.toLowerCase() || '';

        const category =
          product.category?.toLowerCase() || '';

        const search =
          searchTerm.toLowerCase();


        const matchesSearch =
          name.includes(search) ||
          category.includes(search);


        if (!matchesSearch) {
          return false;
        }

        // Para revendedor, ocultar insumos (type === 'raw')
        if (
          config &&
          config.businessType === 'revendedor' &&
          product.type === 'raw'
        ) {
          return false;
        }


        if (
          currentFilter === 'all'
        ) {
          return true;
        }


        return (
          getStockStatus(product).key ===
          currentFilter
        );

      }
    );

  };


  /*
   * ========================================================
   * RENDER PRINCIPAL
   * ========================================================
   */

  const render = async () => {
    try {
      config = await getBusinessConfig();
    } catch {
      config = { businessType: 'revendedor' };
    }

    container.innerHTML = `

      <div class="inventory-page">


        <header class="inventory-header">

          <div>

            <span class="inventory-eyebrow">
              GESTIÓN DEL NEGOCIO
            </span>

            <h1>
              Inventario
            </h1>

            <p>
              Administra tus productos,
              costos y niveles de stock.
            </p>

          </div>


          <button
            type="button"
            id="add-product-button"
            class="inventory-primary-button"
          >
            ＋ Nuevo ${config.businessType === 'fabricante' ? 'insumo / producto' : 'producto'}
          </button>

        </header>


        <!-- RESUMEN -->

        <section
          class="inventory-summary-grid"
        >

          <article
            class="inventory-summary-card"
          >

            <div class="inventory-summary-icon">
              📦
            </div>

            <div>

              <span>
                Productos
              </span>

              <strong
                id="total-products"
              >
                0
              </strong>

            </div>

          </article>


          <article
            class="inventory-summary-card"
          >

            <div class="inventory-summary-icon">
              ✅
            </div>

            <div>

              <span>
                Disponibles
              </span>

              <strong
                id="available-products"
              >
                0
              </strong>

            </div>

          </article>


          <article
            class="inventory-summary-card"
          >

            <div class="inventory-summary-icon">
              ⚠️
            </div>

            <div>

              <span>
                Stock bajo
              </span>

              <strong
                id="low-stock-products"
              >
                0
              </strong>

            </div>

          </article>


          <article
            class="inventory-summary-card"
          >

            <div class="inventory-summary-icon">
              🚫
            </div>

            <div>

              <span>
                Sin stock
              </span>

              <strong
                id="out-of-stock-products"
              >
                0
              </strong>

            </div>

          </article>

        </section>


        <!-- BÚSQUEDA -->

        <section
          class="inventory-toolbar"
        >

          <div class="inventory-search">

            <span>
              🔎
            </span>

            <input
              type="search"
              id="inventory-search"
              placeholder="Buscar producto o categoría..."
              autocomplete="off"
            />

          </div>


          <div
            class="inventory-filters"
          >

            <button
              type="button"
              class="inventory-filter active"
              data-filter="all"
            >
              Todos
            </button>

            <button
              type="button"
              class="inventory-filter"
              data-filter="available"
            >
              Disponibles
            </button>

            <button
              type="button"
              class="inventory-filter"
              data-filter="low"
            >
              Stock bajo
            </button>

            <button
              type="button"
              class="inventory-filter"
              data-filter="out"
            >
              Sin stock
            </button>

          </div>

        </section>


        <!-- PRODUCTOS -->

        <section
          id="inventory-products"
          class="inventory-products"
        ></section>


        <!-- MODAL -->

        <div
          id="product-modal"
          class="inventory-modal"
          aria-hidden="true"
        >

          <div
            id="modal-overlay"
            class="inventory-modal-overlay"
          ></div>


          <div
            class="inventory-modal-content"
            role="dialog"
            aria-modal="true"
          >

            <div
              class="inventory-modal-header"
            >

              <div>

                <span class="inventory-eyebrow">
                  INVENTARIO
                </span>

                <h2 id="modal-title">
                  Nuevo producto
                </h2>

              </div>


              <button
                type="button"
                id="close-modal"
                class="inventory-modal-close"
              >
                ✕
              </button>

            </div>


            <form
              id="product-form"
              class="inventory-form"
            >

              <div
                class="inventory-form-group"
              >

                <label
                  for="product-name"
                >
                  Nombre *
                </label>

                <input
                  type="text"
                  id="product-name"
                  maxlength="100"
                  required
                  placeholder="Ej. Remera básica"
                />

              </div>


              <div
                class="inventory-form-group"
              >

                <label
                  for="product-description"
                >
                  Descripción
                </label>

                <textarea
                  id="product-description"
                  rows="3"
                  maxlength="500"
                  placeholder="Descripción del producto..."
                ></textarea>

              </div>


              <div
                class="inventory-form-row"
              >

                <div
                  class="inventory-form-group"
                >

                  <label
                    for="product-category"
                  >
                    Categoría
                  </label>

                  <input
                    type="text"
                    id="product-category"
                    maxlength="50"
                    placeholder="Ej. Ropa"
                  />

                </div>


                <div
                  class="inventory-form-group"
                >

                  <label
                    for="product-stock"
                  >
                    Stock actual
                  </label>

                  <input
                    type="number"
                    id="product-stock"
                    min="0"
                    step="1"
                    value="0"
                  />

                </div>

              </div>


              <div
                class="inventory-form-row"
              >

                <div
                  class="inventory-form-group"
                >

                  <label
                    for="product-min-stock"
                  >
                    Stock mínimo
                  </label>

                  <input
                    type="number"
                    id="product-min-stock"
                    min="0"
                    step="1"
                    value="0"
                  />

                </div>


                <div
                  class="inventory-form-group"
                >

                  <label
                    for="product-cost"
                  >
                    Costo
                  </label>

                  <input
                    type="number"
                    id="product-cost"
                    min="0"
                    step="0.01"
                    value="0"
                  />

                </div>

              </div>


              <div
                class="inventory-form-group"
              >

                <label
                  for="product-price"
                >
                  Precio de venta
                </label>

                <input
                  type="number"
                  id="product-price"
                  min="0"
                  step="0.01"
                  value="0"
                />

              </div>


              <div
                id="product-margin-preview"
                class="inventory-margin-preview"
              >
                Margen estimado: 0%
              </div>


              <div
                id="product-form-message"
                class="inventory-form-message"
              ></div>


              <div
                class="inventory-form-actions"
              >

                <button
                  type="button"
                  id="cancel-product"
                  class="inventory-secondary-button"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  class="inventory-primary-button"
                >
                  Guardar producto
                </button>

              </div>

            </form>

          </div>

        </div>

      </div>
    `;


    setupEvents();

    await loadProducts();

  };


  /*
   * ========================================================
   * FIRESTORE
   * ========================================================
   */

  const loadProducts = async () => {

    try {

      products =
        await getProducts();

      updateSummary();

      renderProducts();

    } catch (error) {

      console.error(
        'Error cargando productos:',
        error
      );


      const productsContainer =
        container.querySelector(
          '#inventory-products'
        );


      if (productsContainer) {

        productsContainer.innerHTML = `

          <div class="inventory-error">

            <strong>
              No se pudo cargar el inventario.
            </strong>

            <p>
              ${escapeHtml(error.message)}
            </p>

          </div>

        `;

      }

    }

  };


  /*
   * ========================================================
   * RESUMEN
   * ========================================================
   */

  const updateSummary = () => {

    const productsToCount = config &&
      config.businessType === 'revendedor'
      ? products.filter(p => p.type !== 'raw')
      : products;

    const available =
      productsToCount.filter(
        product =>
          getStockStatus(product).key ===
          'available'
      ).length;


    const low =
      productsToCount.filter(
        product =>
          getStockStatus(product).key ===
          'low'
      ).length;


    const out =
      productsToCount.filter(
        product =>
          getStockStatus(product).key ===
          'out'
      ).length;


    container.querySelector(
      '#total-products'
    ).textContent =
      productsToCount.length;


    container.querySelector(
      '#available-products'
    ).textContent =
      available;


    container.querySelector(
      '#low-stock-products'
    ).textContent =
      low;


    container.querySelector(
      '#out-of-stock-products'
    ).textContent =
      out;

  };


  /*
   * ========================================================
   * PRODUCTOS
   * ========================================================
   */

  const renderProducts = () => {

    const productsContainer =
      container.querySelector(
        '#inventory-products'
      );


    const filteredProducts =
      getFilteredProducts();


    if (!filteredProducts.length) {

      productsContainer.innerHTML = `

        <div class="inventory-empty">

          <div class="inventory-empty-icon">
            📦
          </div>

          <h3>
            ${
              products.length
                ? 'No se encontraron productos'
                : 'Tu inventario está vacío'
            }
          </h3>

          <p>
            ${
              products.length
                ? 'Probá con otra búsqueda o filtro.'
                : 'Comenzá agregando tu primer producto.'
            }
          </p>

          ${
            !products.length
              ? `
                <button
                  type="button"
                  id="empty-add-product"
                  class="inventory-primary-button"
                >
                  ＋ Agregar producto
                </button>
              `
              : ''
          }

        </div>

      `;


      const emptyButton =
        container.querySelector(
          '#empty-add-product'
        );


      if (emptyButton) {

        emptyButton.addEventListener(
          'click',
          openCreateModal
        );

      }


      return;

    }


    productsContainer.innerHTML =
      filteredProducts.map(
        product => {

          const status =
            getStockStatus(product);

          const margin =
            calculateMargin(product);


          return `

            <article
              class="inventory-product-card"
            >

              <div
                class="inventory-product-image"
              >

                ${
                  product.imageURL
                    ? `
                      <img
                        src="${escapeHtml(
                          product.imageURL
                        )}"
                        alt="${escapeHtml(
                          product.name
                        )}"
                      />
                    `
                    : `
                      <span>
                        📦
                      </span>
                    `
                }

              </div>


              <div
                class="inventory-product-content"
              >

                <div
                  class="inventory-product-top"
                >

                  <div>

                    <h3>
                      ${escapeHtml(
                        product.name
                      )}
                    </h3>

                    ${
                      product.category
                        ? `
                          <span
                            class="inventory-product-category"
                          >
                            ${escapeHtml(
                              product.category
                            )}
                          </span>
                        `
                        : ''
                    }

                  </div>


                  <span
                    class="
                      inventory-stock-badge
                      ${status.key}
                    "
                  >
                    ${status.label}
                  </span>

                </div>


                ${
                  product.description
                    ? `
                      <p
                        class="inventory-product-description"
                      >
                        ${escapeHtml(
                          product.description
                        )}
                      </p>
                    `
                    : ''
                }


                <div
                  class="inventory-product-data"
                >

                  <div>

                    <span>
                      Stock
                    </span>

                    <strong>
                      ${product.stock || 0}
                    </strong>

                  </div>


                  <div>

                    <span>
                      Costo
                    </span>

                    <strong>
                      ${formatCurrency(
                        product.cost
                      )}
                    </strong>

                  </div>


                  <div>

                    <span>
                      Precio
                    </span>

                    <strong>
                      ${formatCurrency(
                        product.price
                      )}
                    </strong>

                  </div>


                  <div>

                    <span>
                      Margen
                    </span>

                    <strong>
                      ${margin.toFixed(1)}%
                    </strong>

                  </div>

                </div>


                <div
                  class="inventory-product-actions"
                >

                  <button
                    type="button"
                    class="inventory-edit-button"
                    data-id="${product.id}"
                  >
                    ✏️ Editar
                  </button>


                  <button
                    type="button"
                    class="inventory-delete-button"
                    data-id="${product.id}"
                  >
                    🗑️ Eliminar
                  </button>

                </div>

              </div>

            </article>

          `;

        }
      ).join('');


    /*
     * Editar.
     */
    productsContainer
      .querySelectorAll(
        '.inventory-edit-button'
      )
      .forEach(button => {

        button.addEventListener(
          'click',
          () => {

            const product =
              products.find(
                item =>
                  item.id ===
                  button.dataset.id
              );


            if (product) {

              openEditModal(
                product
              );

            }

          }
        );

      });


    /*
     * Eliminar.
     */
    productsContainer
      .querySelectorAll(
        '.inventory-delete-button'
      )
      .forEach(button => {

        button.addEventListener(
          'click',
          () => {

            const product =
              products.find(
                item =>
                  item.id ===
                  button.dataset.id
              );


            if (product) {

              handleDeleteProduct(
                product
              );

            }

          }
        );

      });

  };


  /*
   * ========================================================
   * EVENTOS
   * ========================================================
   */

  const setupEvents = () => {

    container
      .querySelector(
        '#add-product-button'
      )
      .addEventListener(
        'click',
        openCreateModal
      );


    container
      .querySelector(
        '#inventory-search'
      )
      .addEventListener(
        'input',
        event => {

          searchTerm =
            event.target.value.trim();

          renderProducts();

        }
      );


    container
      .querySelectorAll(
        '.inventory-filter'
      )
      .forEach(button => {

        button.addEventListener(
          'click',
          () => {

            currentFilter =
              button.dataset.filter;


            container
              .querySelectorAll(
                '.inventory-filter'
              )
              .forEach(item => {

                item.classList.remove(
                  'active'
                );

              });


            button.classList.add(
              'active'
            );


            renderProducts();

          }
        );

      });


    container
      .querySelector(
        '#close-modal'
      )
      .addEventListener(
        'click',
        closeModal
      );


    container
      .querySelector(
        '#cancel-product'
      )
      .addEventListener(
        'click',
        closeModal
      );


    container
      .querySelector(
        '#modal-overlay'
      )
      .addEventListener(
        'click',
        closeModal
      );


    container
      .querySelector(
        '#product-form'
      )
      .addEventListener(
        'submit',
        handleProductSubmit
      );


    const costInput =
      container.querySelector(
        '#product-cost'
      );

    const priceInput =
      container.querySelector(
        '#product-price'
      );


    const updateMarginPreview = () => {

      const cost =
        Number(costInput.value) || 0;

      const price =
        Number(priceInput.value) || 0;


      let margin = 0;


      if (price > 0) {

        margin =
          ((price - cost) / price) *
          100;

      }


      container.querySelector(
        '#product-margin-preview'
      ).textContent =
        `Margen estimado: ${margin.toFixed(1)}%`;

    };


    costInput.addEventListener(
      'input',
      updateMarginPreview
    );


    priceInput.addEventListener(
      'input',
      updateMarginPreview
    );


    document.addEventListener(
      'keydown',
      handleEscape
    );

  };


  /*
   * ========================================================
   * MODAL - CREAR
   * ========================================================
   */

  const openCreateModal = () => {

    editingProductId = null;


    const form =
      container.querySelector(
        '#product-form'
      );


    form.reset();


    container.querySelector(
      '#product-stock'
    ).value = 0;


    container.querySelector(
      '#product-min-stock'
    ).value = 0;


    container.querySelector(
      '#product-cost'
    ).value = 0;


    container.querySelector(
      '#product-price'
    ).value = 0;


    container.querySelector(
      '#modal-title'
    ).textContent =
      'Nuevo producto';


    container.querySelector(
      '#product-form-message'
    ).textContent = '';


    updateModalState(true);

  };


  /*
   * ========================================================
   * MODAL - EDITAR
   * ========================================================
   */

  const openEditModal = (product) => {

    editingProductId =
      product.id;


    container.querySelector(
      '#modal-title'
    ).textContent =
      'Editar producto';


    container.querySelector(
      '#product-name'
    ).value =
      product.name || '';


    container.querySelector(
      '#product-description'
    ).value =
      product.description || '';


    container.querySelector(
      '#product-category'
    ).value =
      product.category || '';


    container.querySelector(
      '#product-stock'
    ).value =
      product.stock ?? 0;


    container.querySelector(
      '#product-min-stock'
    ).value =
      product.minStock ?? 0;


    container.querySelector(
      '#product-cost'
    ).value =
      product.cost ?? 0;


    container.querySelector(
      '#product-price'
    ).value =
      product.price ?? 0;


    container.querySelector(
      '#product-form-message'
    ).textContent = '';


    updateModalState(true);

  };


  /*
   * ========================================================
   * MODAL
   * ========================================================
   */

  const updateModalState = (open) => {

    const modal =
      container.querySelector(
        '#product-modal'
      );


    if (open) {

      modal.classList.add(
        'open'
      );

      modal.setAttribute(
        'aria-hidden',
        'false'
      );

    } else {

      modal.classList.remove(
        'open'
      );

      modal.setAttribute(
        'aria-hidden',
        'true'
      );

    }

  };


  const closeModal = () => {

    updateModalState(false);

    editingProductId = null;

  };


  /*
   * ========================================================
   * GUARDAR
   * ========================================================
   */

  const handleProductSubmit = async (
    event
  ) => {

    event.preventDefault();


    const message =
      container.querySelector(
        '#product-form-message'
      );


    const productData = {

      name:
        container.querySelector(
          '#product-name'
        ).value,

      description:
        container.querySelector(
          '#product-description'
        ).value,

      category:
        container.querySelector(
          '#product-category'
        ).value,

      stock:
        Number(
          container.querySelector(
            '#product-stock'
          ).value
        ) || 0,

      minStock:
        Number(
          container.querySelector(
            '#product-min-stock'
          ).value
        ) || 0,

      cost:
        Number(
          container.querySelector(
            '#product-cost'
          ).value
        ) || 0,

      price:
        Number(
          container.querySelector(
            '#product-price'
          ).value
        ) || 0,

      type:
        config &&
        config.businessType === 'revendedor'
          ? 'product'
          : 'product'

    };


    if (!productData.name.trim()) {

      message.textContent =
        'El nombre es obligatorio.';

      return;

    }


    if (
      productData.price <
      productData.cost
    ) {

      const confirmed =
        window.confirm(
          'El precio de venta es menor que el costo. ¿Querés guardar igualmente?'
        );


      if (!confirmed) {
        return;
      }

    }


    try {

      message.textContent =
        'Guardando en Firebase...';


      if (editingProductId) {

        const existingProduct =
          products.find(
            product =>
              product.id ===
              editingProductId
          );


        productData.imageURL =
          existingProduct?.imageURL ||
          '';


        await updateProduct(
          editingProductId,
          productData
        );

      } else {

        productData.imageURL = '';

        await createProduct(
          productData
        );

      }


      closeModal();

      await loadProducts();

    } catch (error) {

      console.error(
        'Error guardando producto:',
        error
      );


      message.textContent =
        `No se pudo guardar: ${error.message}`;

    }

  };


  /*
   * ========================================================
   * ELIMINAR
   * ========================================================
   */

  const handleDeleteProduct = async (
    product
  ) => {

    const confirmed =
      window.confirm(
        `¿Seguro que querés eliminar "${product.name}"?`
      );


    if (!confirmed) {
      return;
    }


    try {

      await deleteProduct(
        product.id
      );


      products =
        products.filter(
          item =>
            item.id !==
            product.id
        );


      updateSummary();

      renderProducts();

    } catch (error) {

      console.error(
        'Error eliminando producto:',
        error
      );


      window.alert(
        `No se pudo eliminar: ${error.message}`
      );

    }

  };


  /*
   * ========================================================
   * ESC
   * ========================================================
   */

  const handleEscape = (event) => {

    if (
      event.key === 'Escape'
    ) {

      closeModal();

    }

  };


  /*
   * ========================================================
   * DESTROY
   * ========================================================
   */

  const destroy = () => {

    document.removeEventListener(
      'keydown',
      handleEscape
    );

  };


  /*
   * ========================================================
   * INICIO
   * ========================================================
   */

  render();


  const layout =
    createAppLayout(
      container,
      '#inventory'
    );


  return {

    render,

    destroy,

    element:
      layout.element

  };

}