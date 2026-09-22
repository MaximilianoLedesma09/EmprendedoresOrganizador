// prices.js
import {
  getBusinessConfig,
  saveBusinessConfig,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  calcSuggestedPrice,
  calcMargin,
  calcProfit,
  formatCurrency
} from '../services/pricing-service.js';

export default async function pricesView() {
  const container = document.createElement('div');
  container.className = 'prices-container';

  let config = null;
  let products = [];

  const render = async () => {
    try {
      config = await getBusinessConfig();
      products = await getProducts();

      container.innerHTML = `
        <div class="prices-header">
          <h2>💰 Lista de Precios</h2>
          <div class="prices-config">
            <label>Tipo de negocio:
              <select id="business-type">
                <option value="revendedor" ${config.businessType === 'revendedor' ? 'selected' : ''}>Revendedor</option>
                <option value="fabricante" ${config.businessType === 'fabricante' ? 'selected' : ''}>Fabricante</option>
              </select>
            </label>
            <label>Moneda:
              <select id="currency">
                <option value="ARS" ${config.currency === 'ARS' ? 'selected' : ''}>ARS</option>
                <option value="USD" ${config.currency === 'USD' ? 'selected' : ''}>USD</option>
                <option value="EUR" ${config.currency === 'EUR' ? 'selected' : ''}>EUR</option>
                <option value="MXN" ${config.currency === 'MXN' ? 'selected' : ''}>MXN</option>
              </select>
            </label>
            <label>Margen por defecto (%):
              <input type="number" id="default-margin" value="${config.defaultMargin}" min="0" step="1" />
            </label>
            <button id="save-config-btn">Guardar configuración</button>
          </div>
        </div>

        <div class="prices-actions">
          <button id="add-product-btn" class="primary-btn">+ Agregar ${config.businessType === 'fabricante' ? 'insumo / producto' : 'producto'}</button>
          <span id="prices-summary"></span>
        </div>

        <div id="products-list"></div>
      `;

      // Render inicial
      renderProductsList();

      // Guardar configuración
      container.querySelector('#save-config-btn').addEventListener('click', async () => {
        const newConfig = {
          businessType: container.querySelector('#business-type').value,
          currency: container.querySelector('#currency').value,
          defaultMargin: Number(container.querySelector('#default-margin').value) || 0
        };
        await saveBusinessConfig(newConfig);
        config = newConfig;
        renderProductsList();
        alert('✅ Configuración guardada');
      });

      // Botón agregar
      container.querySelector('#add-product-btn').addEventListener('click', () => {
        showProductForm();
      });

    } catch (error) {
      console.error('Error cargando precios:', error);
      container.innerHTML = `<p>Error: ${error.message}</p>`;
    }
  };

  // Renderizar la tabla de productos
  const renderProductsList = () => {
    const list = container.querySelector('#products-list');
    if (!list) return;

    const summary = container.querySelector('#prices-summary');

    if (products.length === 0) {
      list.innerHTML = `<p class="empty-message">No hay productos cargados todavía. Agregá el primero con el botón de arriba.</p>`;
      if (summary) summary.textContent = '';
      return;
    }

    // Resumen
    const totalCost = products.reduce((acc, p) => acc + (p.unitCost || 0) * (p.stock || 1), 0);
    const totalSale = products.reduce((acc, p) => acc + (p.salePrice || 0) * (p.stock || 1), 0);
    if (summary) {
      summary.innerHTML = `
        <strong>${products.length}</strong> ítems · 
        Costo total: <strong>${formatCurrency(totalCost, config.currency)}</strong> · 
        Venta total: <strong>${formatCurrency(totalSale, config.currency)}</strong>
      `;
    }

    // Tabla
    let html = `
      <table class="prices-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>SKU</th>
            <th>Categoría</th>
            ${config.businessType === 'fabricante' ? '<th>Tipo</th>' : ''}
            <th>Costo</th>
            <th>Margen (%)</th>
            <th>Precio sugerido</th>
            <th>Precio venta</th>
            <th>Ganancia</th>
            <th>Stock</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
    `;

    products.forEach(p => {
      const suggested = calcSuggestedPrice(p.unitCost, p.margin ?? config.defaultMargin);
      const profit = calcProfit(p.unitCost, p.salePrice || suggested);
      const marginReal = calcMargin(p.unitCost, p.salePrice || suggested);
      const typeLabel = p.type === 'raw' ? 'Insumo' : (p.type === 'final' ? 'Producto final' : 'Producto');

      html += `
        <tr>
          <td>${p.name}</td>
          <td>${p.sku || '-'}</td>
          <td>${p.category || '-'}</td>
          ${config.businessType === 'fabricante' ? `<td>${typeLabel}</td>` : ''}
          <td>${formatCurrency(p.unitCost, config.currency)}</td>
          <td>${(p.margin ?? config.defaultMargin).toFixed(1)}%</td>
          <td><strong>${formatCurrency(suggested, config.currency)}</strong></td>
          <td>${formatCurrency(p.salePrice || suggested, config.currency)}</td>
          <td class="${profit >= 0 ? 'positive' : 'negative'}">
            ${formatCurrency(profit, config.currency)} (${marginReal}%)
          </td>
          <td>${p.stock}</td>
          <td>
            <button data-id="${p.id}" class="edit-btn">✏️</button>
            <button data-id="${p.id}" class="delete-btn">🗑️</button>
          </td>
        </tr>
      `;
    });

    html += `</tbody></table>`;
    list.innerHTML = html;

    // Eventos de editar y eliminar
    list.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const product = products.find(p => p.id === btn.dataset.id);
        if (product) showProductForm(product);
      });
    });

    list.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (confirm('¿Eliminar este producto?')) {
          await deleteProduct(btn.dataset.id);
          products = await getProducts();
          renderProductsList();
        }
      });
    });
  };

  // Modal para crear/editar producto
  const showProductForm = (product = null) => {
    const isEdit = !!product;
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';

    const showTypeSelector = config.businessType === 'fabricante';

    modal.innerHTML = `
      <div class="modal-content">
        <h3>${isEdit ? 'Editar' : 'Nuevo'} ${config.businessType === 'fabricante' ? 'ítem' : 'producto'}</h3>
        <form id="product-form">
          <div>
            <label>Nombre *</label>
            <input type="text" id="p-name" value="${product?.name || ''}" required />
          </div>
          <div>
            <label>SKU / Código</label>
            <input type="text" id="p-sku" value="${product?.sku || ''}" />
          </div>
          <div>
            <label>Categoría</label>
            <input type="text" id="p-category" value="${product?.category || ''}" />
          </div>

          ${showTypeSelector ? `
          <div>
            <label>Tipo</label>
            <select id="p-type">
              <option value="raw" ${product?.type === 'raw' ? 'selected' : ''}>Insumo</option>
              <option value="final" ${product?.type === 'final' ? 'selected' : ''}>Producto final</option>
            </select>
          </div>` : ''}

          <div>
            <label>Costo unitario</label>
            <input type="number" id="p-cost" value="${product?.unitCost ?? 0}" min="0" step="0.01" />
          </div>
          <div>
            <label>Margen (%)</label>
            <input type="number" id="p-margin" value="${product?.margin ?? config.defaultMargin}" min="0" step="1" />
          </div>
          <div>
            <label>Precio de venta (dejar 0 para sugerido)</label>
            <input type="number" id="p-sale" value="${product?.salePrice ?? 0}" min="0" step="0.01" />
          </div>
          <div class="suggested-preview" id="suggested-preview"></div>
          <div>
            <label>Stock</label>
            <input type="number" id="p-stock" value="${product?.stock ?? 0}" min="0" step="1" />
          </div>
          <div>
            <label>Notas</label>
            <textarea id="p-notes">${product?.notes || ''}</textarea>
          </div>

          <div class="modal-actions">
            <button type="submit" class="primary-btn">${isEdit ? 'Actualizar' : 'Crear'}</button>
            <button type="button" id="cancel-modal">Cancelar</button>
            ${isEdit ? `<button type="button" id="delete-in-modal" class="danger-btn">Eliminar</button>` : ''}
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);

    // Vista previa del precio sugerido
    const costInput = modal.querySelector('#p-cost');
    const marginInput = modal.querySelector('#p-margin');
    const preview = modal.querySelector('#suggested-preview');

    const updatePreview = () => {
      const c = Number(costInput.value) || 0;
      const m = Number(marginInput.value) || 0;
      const suggested = calcSuggestedPrice(c, m);
      preview.textContent = `💡 Precio sugerido: ${formatCurrency(suggested, config.currency)} · Ganancia: ${formatCurrency(suggested - c, config.currency)}`;
    };
    updatePreview();
    costInput.addEventListener('input', updatePreview);
    marginInput.addEventListener('input', updatePreview);

    // Submit
    modal.querySelector('#product-form').addEventListener('submit', async (e) => {
      e.preventDefault();

      const data = {
        name: modal.querySelector('#p-name').value.trim(),
        sku: modal.querySelector('#p-sku').value.trim(),
        category: modal.querySelector('#p-category').value.trim(),
        type: showTypeSelector ? modal.querySelector('#p-type').value : 'product',
        unitCost: Number(modal.querySelector('#p-cost').value) || 0,
        margin: Number(modal.querySelector('#p-margin').value) || 0,
        salePrice: Number(modal.querySelector('#p-sale').value) || 0,
        stock: Number(modal.querySelector('#p-stock').value) || 0,
        notes: modal.querySelector('#p-notes').value.trim()
      };

      if (!data.name) return alert('El nombre es obligatorio');

      // Si no se especificó precio de venta, usar el sugerido
      if (data.salePrice === 0) {
        data.salePrice = calcSuggestedPrice(data.unitCost, data.margin);
      }

      try {
        if (isEdit) {
          await updateProduct(product.id, data);
        } else {
          await createProduct(data);
        }
        modal.remove();
        products = await getProducts();
        renderProductsList();
      } catch (error) {
        alert('Error guardando: ' + error.message);
      }
    });

    modal.querySelector('#cancel-modal').addEventListener('click', () => modal.remove());
    if (isEdit) {
      modal.querySelector('#delete-in-modal').addEventListener('click', async () => {
        if (confirm('¿Eliminar este producto?')) {
          await deleteProduct(product.id);
          modal.remove();
          products = await getProducts();
          renderProductsList();
        }
      });
    }
  };

  const destroy = () => {};

  await render();
  return { render, destroy, element: container };
}