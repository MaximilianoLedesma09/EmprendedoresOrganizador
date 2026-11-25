// materials.js
import { createAppLayout } from '../components/app-layout.js';
import {
  getBusinessConfig
} from '../services/pricing-service.js';
import {
  getMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial
} from '../services/materials-service.js';
import { formatCurrency } from '../services/pricing-service.js';

export default function materialsView() {
  const container = document.createElement('div');
  container.className = 'materials-container';

  let config = null;
  let materials = [];
  let editingMaterialId = null;

  const render = async () => {
    try {
      config = await getBusinessConfig();
      materials = await getMaterials();

      const isFabricante = config.businessType === 'fabricante';

      container.innerHTML = `
        <div class="materials-header">
          <h2>🧵 Materiales e Insumos</h2>
          ${isFabricante ? `
            <button id="add-material-btn" class="primary-btn">+ Agregar material</button>
          ` : ''}
        </div>

        ${!isFabricante ? `
          <div class="empty-message">
            <p>Esta sección es exclusiva para el <strong>modo fabricante</strong>.</p>
            <p>Cambia el tipo de negocio en la configuración de precios para gestionar materiales e insumos.</p>
          </div>
        ` : `
          <div id="materials-list"></div>
        `}
      `;

      if (isFabricante) {
        renderMaterialsList();
        container.querySelector('#add-material-btn').addEventListener('click', () => {
          showMaterialForm();
        });
      }

    } catch (error) {
      console.error('Error cargando materiales:', error);
      container.innerHTML = `<p>Error: ${error.message}</p>`;
    }
  };

  const renderMaterialsList = () => {
    const list = container.querySelector('#materials-list');
    if (!list) return;

    if (materials.length === 0) {
      list.innerHTML = `<p class="empty-message">No hay materiales cargados todavía. Agregá el primero con el botón de arriba.</p>`;
      return;
    }

    let html = `
      <table class="prices-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Precio unitario</th>
            <th>Unidad de medida</th>
            <th>Stock</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
    `;

    materials.forEach(m => {
      html += `
        <tr>
          <td>${escapeHtml(m.name)}</td>
          <td>${escapeHtml(m.description)}</td>
          <td>${formatCurrency(m.unitCost, config.currency)}</td>
          <td>${escapeHtml(m.unitOfMeasure)}</td>
          <td>${m.stock}</td>
          <td>
            <button data-id="${m.id}" class="edit-btn">✎</button>
            <button data-id="${m.id}" class="delete-btn">🗑️</button>
          </td>
        </tr>
      `;
    });

    html += `</tbody></table>`;
    list.innerHTML = html;

    list.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const material = materials.find(m => m.id === btn.dataset.id);
        if (material) showMaterialForm(material);
      });
    });

    list.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (confirm('¿Seguro que querés eliminar este material?')) {
          try {
            await deleteMaterial(btn.dataset.id);
            materials = await getMaterials();
            renderMaterialsList();
          } catch (error) {
            alert('Error eliminando: ' + error.message);
          }
        }
      });
    });
  };

  const escapeHtml = (value) => {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  };

  const showMaterialForm = (material = null) => {
    const isEdit = !!material;
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';

    modal.innerHTML = `
      <div class="modal-content">
        <h3>${isEdit ? 'Editar' : 'Nuevo'} material</h3>
        <form id="material-form">
          <div>
            <label>Nombre *</label>
            <input type="text" id="m-name" value="${escapeHtml(material?.name || '')}" required />
          </div>
          <div>
            <label>Descripción</label>
            <input type="text" id="m-description" value="${escapeHtml(material?.description || '')}" />
          </div>
          <div>
            <label>Precio unitario *</label>
            <input type="number" id="m-unit-cost" value="${material?.unitCost ?? 0}" min="0" step="0.01" required />
          </div>
          <div>
            <label>Unidad de medida</label>
            <input type="text" id="m-unit-measure" value="${escapeHtml(material?.unitOfMeasure || 'unidad')}" placeholder="ej: kg, litro, unidad" />
          </div>
          <div>
            <label>Stock</label>
            <input type="number" id="m-stock" value="${material?.stock ?? 0}" min="0" step="1" />
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

    modal.querySelector('#material-form').addEventListener('submit', async (e) => {
      e.preventDefault();

      const data = {
        name: modal.querySelector('#m-name').value.trim(),
        description: modal.querySelector('#m-description').value.trim(),
        unitCost: modal.querySelector('#m-unit-cost').value,
        unitOfMeasure: modal.querySelector('#m-unit-measure').value.trim() || 'unidad',
        stock: modal.querySelector('#m-stock').value
      };

      if (!data.name) return alert('El nombre es obligatorio');

      try {
        if (isEdit) {
          await updateMaterial(editingMaterialId, data);
        } else {
          await createMaterial(data);
        }
        modal.remove();
        materials = await getMaterials();
        renderMaterialsList();
      } catch (error) {
        alert('Error guardando: ' + error.message);
      }
    });

  const destroy = () => {};

  await render();
  const layout = createAppLayout(container, '#materials');

  return {
    render,
    destroy,
    element: layout.element
  };
}

    modal.querySelector('#cancel-modal').addEventListener('click', () => modal.remove());

    if (isEdit) {
      modal.querySelector('#delete-in-modal').addEventListener('click', async () => {
        if (confirm('¿Eliminar este material?')) {
          try {
            await deleteMaterial(editingMaterialId);
            modal.remove();
            materials = await getMaterials();
            renderMaterialsList();
          } catch (error) {
            alert('Error eliminando: ' + error.message);
          }
        }
      });
    }
  };

// Vista de gestión de materiales e insumos (modo fabricante).
