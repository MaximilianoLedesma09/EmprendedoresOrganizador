import { createAppLayout } from '../components/app-layout.js';

export default function metricsView() {
  const container = document.createElement('div');
  container.className = 'metrics-container';

  let currentPeriod = 'month';

  /*
   * Estructura de datos preparada para conectar
   * posteriormente con Firestore.
   */
  let metricsData = {
    today: {
      sales: 0,
      revenue: 0,
      products: 0
    },

    week: {
      sales: 0,
      revenue: 0,
      products: 0
    },

    month: {
      sales: 0,
      revenue: 0,
      products: 0
    },

    previousMonth: {
      sales: 0,
      revenue: 0,
      products: 0
    },

    topProducts: [],

    chart: []
  };

  /*
   * Formatea valores monetarios.
   */
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  /*
   * Formatea números.
   */
  const formatNumber = (value) => {
    return new Intl.NumberFormat('es-AR').format(value || 0);
  };

  /*
   * Calcula crecimiento porcentual.
   */
  const calculateGrowth = (current, previous) => {
    if (!previous || previous === 0) {
      return current > 0 ? 100 : 0;
    }

    return ((current - previous) / previous) * 100;
  };

  /*
   * Obtiene los datos del período seleccionado.
   */
  const getCurrentData = () => {
    return metricsData[currentPeriod] || {
      sales: 0,
      revenue: 0,
      products: 0
    };
  };

  /*
   * Actualiza las tarjetas principales.
   */
  const updateSummary = () => {
    const data = getCurrentData();

    const revenueElement = container.querySelector(
      '#metrics-revenue'
    );

    const salesElement = container.querySelector(
      '#metrics-sales'
    );

    const productsElement = container.querySelector(
      '#metrics-products'
    );

    const growthElement = container.querySelector(
      '#metrics-growth'
    );

    if (revenueElement) {
      revenueElement.textContent = formatCurrency(
        data.revenue
      );
    }

    if (salesElement) {
      salesElement.textContent = formatNumber(
        data.sales
      );
    }

    if (productsElement) {
      productsElement.textContent = formatNumber(
        data.products
      );
    }

    if (growthElement) {
      const growth = calculateGrowth(
        data.revenue,
        metricsData.previousMonth.revenue
      );

      const roundedGrowth = Number(
        growth.toFixed(1)
      );

      growthElement.textContent =
        `${roundedGrowth >= 0 ? '+' : ''}${roundedGrowth}%`;

      growthElement.classList.remove(
        'metrics-positive',
        'metrics-negative',
        'metrics-neutral'
      );

      if (roundedGrowth > 0) {
        growthElement.classList.add(
          'metrics-positive'
        );
      } else if (roundedGrowth < 0) {
        growthElement.classList.add(
          'metrics-negative'
        );
      } else {
        growthElement.classList.add(
          'metrics-neutral'
        );
      }
    }
  };

  /*
   * Renderiza el gráfico.
   *
   * Por ahora depende de metricsData.chart.
   * Más adelante los datos vendrán de Firestore.
   */
  const renderChart = () => {
    const chart = container.querySelector(
      '#metrics-chart'
    );

    if (!chart) {
      return;
    }

    const data = metricsData.chart || [];

    if (!data.length) {
      chart.innerHTML = `
        <div class="metrics-chart-empty">

          <div class="metrics-chart-empty-icon">
            📈
          </div>

          <strong>
            Aún no hay datos suficientes
          </strong>

          <span>
            Cuando registres ventas, aquí podrás
            visualizar la evolución de tu actividad.
          </span>

        </div>
      `;

      return;
    }

    const maxValue = Math.max(
      ...data.map(item => item.value),
      1
    );

    chart.innerHTML = `
      <div class="metrics-chart-bars">

        ${data.map(item => {
          const height = Math.max(
            (item.value / maxValue) * 100,
            3
          );

          return `
            <div class="metrics-chart-column">

              <div class="metrics-chart-value">
                ${formatCurrency(item.value)}
              </div>

              <div class="metrics-chart-bar-container">

                <div
                  class="metrics-chart-bar"
                  style="height: ${height}%"
                  title="${formatCurrency(item.value)}"
                ></div>

              </div>

              <div class="metrics-chart-label">
                ${item.label}
              </div>

            </div>
          `;
        }).join('')}

      </div>
    `;
  };

  /*
   * Renderiza los productos más vendidos.
   */
  const renderTopProducts = () => {
    const productsContainer = container.querySelector(
      '#top-products'
    );

    if (!productsContainer) {
      return;
    }

    const products = metricsData.topProducts || [];

    if (!products.length) {
      productsContainer.innerHTML = `
        <div class="metrics-empty-state">

          <span class="metrics-empty-icon">
            📦
          </span>

          <div>
            <strong>
              Aún no hay productos vendidos
            </strong>

            <p>
              Cuando registres ventas aparecerán aquí
              tus productos con mejor rendimiento.
            </p>
          </div>

        </div>
      `;

      return;
    }

    const maxSales = Math.max(
      ...products.map(product => product.sales),
      1
    );

    productsContainer.innerHTML = products
      .map((product, index) => {

        const percentage =
          (product.sales / maxSales) * 100;

        return `
          <div class="top-product">

            <div class="top-product-position">
              ${index + 1}
            </div>

            <div class="top-product-info">

              <div class="top-product-header">

                <strong>
                  ${product.name}
                </strong>

                <span>
                  ${formatNumber(product.sales)}
                  ventas
                </span>

              </div>

              <div class="top-product-progress">

                <div
                  class="top-product-progress-bar"
                  style="width: ${percentage}%"
                ></div>

              </div>

            </div>

          </div>
        `;
      })
      .join('');
  };

  /*
   * Renderiza la vista completa.
   */
  const render = () => {
    container.innerHTML = `
      <div class="metrics-page">

        <!-- ENCABEZADO -->

        <header class="metrics-header">

          <div>

            <span class="metrics-eyebrow">
              ANÁLISIS DEL NEGOCIO
            </span>

            <h1>
              Métricas
            </h1>

            <p>
              Comprende el rendimiento de tu negocio
              y observa su evolución.
            </p>

          </div>


          <!-- SELECTOR DE PERÍODO -->

          <div class="metrics-period-selector">

            <button
              type="button"
              class="metrics-period-button ${
                currentPeriod === 'today'
                  ? 'active'
                  : ''
              }"
              data-period="today"
            >
              Hoy
            </button>

            <button
              type="button"
              class="metrics-period-button ${
                currentPeriod === 'week'
                  ? 'active'
                  : ''
              }"
              data-period="week"
            >
              Semana
            </button>

            <button
              type="button"
              class="metrics-period-button ${
                currentPeriod === 'month'
                  ? 'active'
                  : ''
              }"
              data-period="month"
            >
              Mes
            </button>

          </div>

        </header>


        <!-- RESUMEN -->

        <section class="metrics-summary-grid">


          <!-- INGRESOS -->

          <article class="metrics-card">

            <div class="metrics-card-top">

              <div class="metrics-card-icon">
                💰
              </div>

              <span class="metrics-card-label">
                Ingresos
              </span>

            </div>

            <div
              id="metrics-revenue"
              class="metrics-card-value"
            >
              $0
            </div>

            <div class="metrics-card-description">
              Total generado en el período
            </div>

          </article>


          <!-- VENTAS -->

          <article class="metrics-card">

            <div class="metrics-card-top">

              <div class="metrics-card-icon">
                🛒
              </div>

              <span class="metrics-card-label">
                Ventas
              </span>

            </div>

            <div
              id="metrics-sales"
              class="metrics-card-value"
            >
              0
            </div>

            <div class="metrics-card-description">
              Operaciones realizadas
            </div>

          </article>


          <!-- PRODUCTOS -->

          <article class="metrics-card">

            <div class="metrics-card-top">

              <div class="metrics-card-icon">
                📦
              </div>

              <span class="metrics-card-label">
                Productos vendidos
              </span>

            </div>

            <div
              id="metrics-products"
              class="metrics-card-value"
            >
              0
            </div>

            <div class="metrics-card-description">
              Unidades vendidas
            </div>

          </article>


          <!-- CRECIMIENTO -->

          <article class="metrics-card">

            <div class="metrics-card-top">

              <div class="metrics-card-icon">
                📈
              </div>

              <span class="metrics-card-label">
                Crecimiento
              </span>

            </div>

            <div
              id="metrics-growth"
              class="metrics-card-value metrics-neutral"
            >
              0%
            </div>

            <div class="metrics-card-description">
              Comparado con el período anterior
            </div>

          </article>

        </section>


        <!-- EVOLUCIÓN -->

        <section class="metrics-section">

          <div class="metrics-section-header">

            <div>

              <h2>
                Evolución de ventas
              </h2>

              <p>
                Visualiza cómo evolucionaron
                tus ingresos.
              </p>

            </div>

          </div>

          <div
            id="metrics-chart"
            class="metrics-chart"
          ></div>

        </section>


        <!-- DOS COLUMNAS -->

        <div class="metrics-two-columns">


          <!-- PRODUCTOS MÁS VENDIDOS -->

          <section class="metrics-section">

            <div class="metrics-section-header">

              <div>

                <h2>
                  Productos más vendidos
                </h2>

                <p>
                  Los productos con mejor rendimiento.
                </p>

              </div>

            </div>

            <div id="top-products"></div>

          </section>


          <!-- RESUMEN -->

          <section class="metrics-section metrics-performance">

            <div class="metrics-section-header">

              <div>

                <h2>
                  Resumen
                </h2>

                <p>
                  Información general de tu actividad.
                </p>

              </div>

            </div>


            <div class="metrics-performance-list">


              <div class="metrics-performance-item">

                <span class="metrics-performance-icon">
                  💵
                </span>

                <div>

                  <strong>
                    Ingresos
                  </strong>

                  <span>
                    Total generado durante
                    el período seleccionado.
                  </span>

                </div>

              </div>


              <div class="metrics-performance-item">

                <span class="metrics-performance-icon">
                  🛍️
                </span>

                <div>

                  <strong>
                    Ventas
                  </strong>

                  <span>
                    Cantidad de operaciones
                    registradas.
                  </span>

                </div>

              </div>


              <div class="metrics-performance-item">

                <span class="metrics-performance-icon">
                  📦
                </span>

                <div>

                  <strong>
                    Productos
                  </strong>

                  <span>
                    Cantidad total de unidades
                    vendidas.
                  </span>

                </div>

              </div>


              <div class="metrics-performance-item">

                <span class="metrics-performance-icon">
                  🚀
                </span>

                <div>

                  <strong>
                    Crecimiento
                  </strong>

                  <span>
                    Evolución respecto al
                    período anterior.
                  </span>

                </div>

              </div>


            </div>

          </section>

        </div>


        <!-- INFORMACIÓN -->

        <div class="metrics-info-message">

          <span>
            💡
          </span>

          <p>
            Tus métricas se actualizarán automáticamente
            a medida que registres ventas en
            Mi Organizador.
          </p>

        </div>

      </div>
    `;

    /*
     * Eventos del selector de período.
     */
    const periodButtons = container.querySelectorAll(
      '.metrics-period-button'
    );

    periodButtons.forEach(button => {

      button.addEventListener('click', () => {

        const period = button.dataset.period;

        if (
          !period ||
          period === currentPeriod
        ) {
          return;
        }

        currentPeriod = period;

        periodButtons.forEach(item => {
          item.classList.remove('active');
        });

        button.classList.add('active');

        updateSummary();
        renderChart();
        renderTopProducts();
      });

    });

    updateSummary();
    renderChart();
    renderTopProducts();
  };

  /*
   * Permite actualizar las métricas desde otro módulo.
   *
   * Esto será útil cuando conectemos Firestore.
   */
  const setMetricsData = (newData = {}) => {

    metricsData = {
      ...metricsData,
      ...newData
    };

    updateSummary();
    renderChart();
    renderTopProducts();
  };

  /*
   * Limpieza de recursos.
   */
  const destroy = () => {
    // Actualmente no existen listeners
    // externos que deban limpiarse.
  };

  /*
   * Render inicial.
   */
  render();

  /*
   * Integración con la navegación global.
   */
  const layout = createAppLayout(
    container,
    '#metrics'
  );

  return {
    render,
    destroy,
    element: layout.element,
    setMetricsData
  };
}