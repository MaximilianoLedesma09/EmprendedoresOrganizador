import {
  getEventsForMonth,
  getEventsForDay,
  createEvent,
  updateEvent,
  deleteEvent
} from '../services/event-service.js';
import { createAppLayout } from '../components/app-layout.js';


export default function calendarView() {

  // ==============================
  // CONTENEDOR PRINCIPAL
  // ==============================

  const container = document.createElement('div');
  container.className = 'calendar-container';


  // ==============================
  // VARIABLES DEL CALENDARIO
  // ==============================

  let currentDate = new Date();

  let currentView = 'month';

  let events = [];


  // ==============================
  // FUNCIONES AUXILIARES DE FECHA
  // ==============================


  // Formatear mes y año
  const formatMonthYear = (date) => {

    return date.toLocaleDateString('es-AR', {
      month: 'long',
      year: 'numeric'
    });

  };


  // Formatear día del mes
  const formatDay = (date) => {

    return date.getDate();

  };


  // Comparar si dos fechas son el mismo día
  const isSameDay = (date1, date2) => {

    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );

  };


  // Comparar si dos fechas pertenecen al mismo mes
  const isSameMonth = (date1, date2) => {

    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth()
    );

  };


  // Comprobar si una fecha es hoy
  const isToday = (date) => {

    return isSameDay(date, new Date());

  };


  // Agregar meses
  const addMonths = (date, amount) => {

    return new Date(
      date.getFullYear(),
      date.getMonth() + amount,
      1
    );

  };


  // Restar meses
  const subMonths = (date, amount) => {

    return new Date(
      date.getFullYear(),
      date.getMonth() - amount,
      1
    );

  };


  // Obtener el primer día del mes
  const startOfMonth = (date) => {

    return new Date(
      date.getFullYear(),
      date.getMonth(),
      1
    );

  };


  // Obtener el último día del mes
  const endOfMonth = (date) => {

    return new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0
    );

  };


  // Obtener lunes de la semana
  const startOfWeek = (date) => {

    const result = new Date(date);

    let day = result.getDay();

    // Domingo = 0
    // Lunes = 1

    day = day === 0 ? 7 : day;

    result.setDate(
      result.getDate() - day + 1
    );

    result.setHours(0, 0, 0, 0);

    return result;

  };


  // Obtener domingo de la semana
  const endOfWeek = (date) => {

    const result = startOfWeek(date);

    result.setDate(
      result.getDate() + 6
    );

    return result;

  };


  // Generar un array de días entre dos fechas
  const eachDayOfInterval = ({ start, end }) => {

    const days = [];

    const current = new Date(start);

    current.setHours(0, 0, 0, 0);

    const endDate = new Date(end);

    endDate.setHours(0, 0, 0, 0);


    while (current <= endDate) {

      days.push(new Date(current));

      current.setDate(
        current.getDate() + 1
      );

    }


    return days;

  };


  // Convertir fecha a formato HH:mm
  const formatTime = (date) => {

    return date.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

  };


  // Convertir Date a formato para datetime-local
  const formatDateTimeLocal = (date) => {

    if (!date) return '';

    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, '0');

    const day = String(
      date.getDate()
    ).padStart(2, '0');

    const hours = String(
      date.getHours()
    ).padStart(2, '0');

    const minutes = String(
      date.getMinutes()
    ).padStart(2, '0');


    return `${year}-${month}-${day}T${hours}:${minutes}`;

  };


  // ==============================
  // CONVERTIR FECHA DE FIRESTORE
  // ==============================

  const getDateFromFirestore = (date) => {

    if (!date) return null;


    // Timestamp de Firestore
    if (typeof date.toDate === 'function') {

      return date.toDate();

    }


    // Date normal
    if (date instanceof Date) {

      return date;

    }


    // String o timestamp
    return new Date(date);

  };


  // ==============================
  // RENDER PRINCIPAL
  // ==============================

  const render = async () => {

    try {

      const year = currentDate.getFullYear();

      const month = currentDate.getMonth();


      // Obtener eventos del mes
      events = await getEventsForMonth(
        year,
        month
      );


      container.innerHTML = `

        <div class="calendar-header">

          <button id="prev-btn">
            ◀
          </button>


          <h2>
            ${formatMonthYear(currentDate)}
          </h2>


          <button id="next-btn">
            ▶
          </button>


          <div class="view-selector">

            <button
              data-view="day"
              class="${currentView === 'day' ? 'active' : ''}"
            >
              Día
            </button>


            <button
              data-view="week"
              class="${currentView === 'week' ? 'active' : ''}"
            >
              Semana
            </button>


            <button
              data-view="month"
              class="${currentView === 'month' ? 'active' : ''}"
            >
              Mes
            </button>


            <button
              data-view="year"
              class="${currentView === 'year' ? 'active' : ''}"
            >
              Año
            </button>

          </div>

        </div>


        <div id="calendar-grid"></div>


        <div id="event-detail">

          <h3>
            Eventos del día
          </h3>


          <div id="day-events">

            <p>
              Seleccioná un día para ver sus eventos.
            </p>

          </div>


          <button id="add-event-btn">

            + Agregar evento

          </button>

        </div>

      `;


      // Renderizar calendario
      renderCalendar();


      // ==============================
      // BOTÓN MES ANTERIOR
      // ==============================

      container
        .querySelector('#prev-btn')
        .addEventListener('click', () => {

          currentDate = subMonths(
            currentDate,
            1
          );


          refresh();

        });


      // ==============================
      // BOTÓN MES SIGUIENTE
      // ==============================

      container
        .querySelector('#next-btn')
        .addEventListener('click', () => {

          currentDate = addMonths(
            currentDate,
            1
          );


          refresh();

        });


      // ==============================
      // SELECTOR DE VISTA
      // ==============================

      container
        .querySelectorAll(
          '.view-selector button'
        )
        .forEach(btn => {

          btn.addEventListener(
            'click',
            () => {

              currentView =
                btn.dataset.view;


              // Actualizar botones activos
              container
                .querySelectorAll(
                  '.view-selector button'
                )
                .forEach(button => {

                  button.classList.remove(
                    'active'
                  );

                });


              btn.classList.add(
                'active'
              );


              renderCalendar();

            }
          );

        });


      // ==============================
      // AGREGAR EVENTO
      // ==============================

      container
        .querySelector('#add-event-btn')
        .addEventListener(
          'click',
          () => {

            showEventForm();

          }
        );


    } catch (error) {

      console.error(
        'Error cargando calendario:',
        error
      );


      container.innerHTML = `

        <p>
          Error al cargar el calendario:
          ${error.message}
        </p>

      `;

    }

  };


  // ==============================
  // REFRESCAR CALENDARIO
  // ==============================

  const refresh = async () => {

    try {

      const year =
        currentDate.getFullYear();


      const month =
        currentDate.getMonth();


      events =
        await getEventsForMonth(
          year,
          month
        );


      renderCalendar();


      // Actualizar título
      const header =
        container.querySelector('h2');


      if (header) {

        header.textContent =
          formatMonthYear(
            currentDate
          );

      }


    } catch (error) {

      console.error(
        'Error actualizando calendario:',
        error
      );

    }

  };


  // ==============================
  // RENDERIZAR CALENDARIO
  // ==============================

  const renderCalendar = () => {

    const grid =
      container.querySelector(
        '#calendar-grid'
      );


    if (!grid) return;


    if (currentView === 'month') {

      renderMonthView(grid);

    }


    if (currentView === 'day') {

      renderDayView(grid);

    }


    if (currentView === 'week') {

      renderWeekView(grid);

    }


    if (currentView === 'year') {

      renderYearView(grid);

    }

  };


  // ==============================
  // VISTA MENSUAL
  // ==============================

  const renderMonthView = (grid) => {


    const firstDay =
      startOfMonth(
        currentDate
      );


    const lastDay =
      endOfMonth(
        currentDate
      );


    // Obtener lunes inicial
    const calendarStart =
      startOfWeek(
        firstDay
      );


    // Obtener domingo final
    const calendarEnd =
      endOfWeek(
        lastDay
      );


    // Todos los días que se mostrarán
    const allDays =
      eachDayOfInterval({

        start: calendarStart,

        end: calendarEnd

      });


    let html = `

      <div class="weekdays">

        <div>Lun</div>

        <div>Mar</div>

        <div>Mié</div>

        <div>Jue</div>

        <div>Vie</div>

        <div>Sáb</div>

        <div>Dom</div>

      </div>


      <div class="days-grid">

    `;


    allDays.forEach(day => {


      const isCurrentMonth =
        isSameMonth(
          day,
          currentDate
        );


      // Eventos de este día
      const dayEvents =
        events.filter(event => {

          const eventDate =
            getDateFromFirestore(
              event.startDate
            );


          if (!eventDate) return false;


          return isSameDay(
            eventDate,
            day
          );

        });


      const hasEvents =
        dayEvents.length > 0;


      const isTodayFlag =
        isToday(day);


      html += `

        <div
          class="day-cell
          ${isCurrentMonth ? '' : 'other-month'}
          ${isTodayFlag ? 'today' : ''}"

          data-date="${formatDateTimeLocal(day)}"
        >


          <span class="day-number">

            ${formatDay(day)}

          </span>


          ${
            hasEvents
              ? `
                <span class="event-indicator">
                  ●
                </span>
              `
              : ''
          }


          ${

            dayEvents
              .slice(0, 2)
              .map(event => `

                <div class="mini-event">

                  ${event.title}

                </div>

              `)
              .join('')

          }


          ${

            dayEvents.length > 2

              ? `

                <div class="more-events">

                  +${dayEvents.length - 2} más

                </div>

              `

              : ''

          }


        </div>

      `;

    });


    html += `

      </div>

    `;


    grid.innerHTML = html;


    // ==============================
    // CLICK EN UN DÍA
    // ==============================

    grid
      .querySelectorAll(
        '.day-cell'
      )
      .forEach(cell => {

        cell.addEventListener(
          'click',
          () => {

            const date =
              new Date(
                cell.dataset.date
              );


            showDayEvents(
              date
            );

          }
        );

      });

  };


  // ==============================
  // MOSTRAR EVENTOS DEL DÍA
  // ==============================

  const showDayEvents = (date) => {


    const dayEvents =
      events.filter(event => {


        const eventDate =
          getDateFromFirestore(
            event.startDate
          );


        if (!eventDate) return false;


        return isSameDay(
          eventDate,
          date
        );

      });


    // IMPORTANTE:
    // No redeclaramos "container"

    const dayEventsContainer =
      container.querySelector(
        '#day-events'
      );


    if (!dayEventsContainer) return;


    // ==============================
    // SIN EVENTOS
    // ==============================

    if (dayEvents.length === 0) {


      dayEventsContainer.innerHTML = `

        <p>
          No hay eventos para este día.
        </p>

      `;


      return;

    }


    // ==============================
    // LISTA DE EVENTOS
    // ==============================

    let html = `<ul>`;


    dayEvents.forEach(event => {


      const startDate =
        getDateFromFirestore(
          event.startDate
        );


      const endDate =
        getDateFromFirestore(
          event.endDate
        );


      const start =
        startDate
          ? formatTime(startDate)
          : '';


      const end =
        endDate
          ? formatTime(endDate)
          : '';


      html += `

        <li class="day-event">

          <strong>

            ${event.title}

          </strong>


          ${
            start
              ? ` ${start}`
              : ''
          }


          ${
            end
              ? ` - ${end}`
              : ''
          }


          <button
            class="edit-event-btn"
            data-id="${event.id}"
          >

            Editar

          </button>

        </li>

      `;

    });


    html += `</ul>`;


    dayEventsContainer.innerHTML =
      html;


    // ==============================
    // BOTONES EDITAR
    // ==============================

    dayEventsContainer
      .querySelectorAll(
        '.edit-event-btn'
      )
      .forEach(button => {


        button.addEventListener(
          'click',
          () => {


            const eventId =
              button.dataset.id;


            const eventData =
              events.find(event =>
                event.id === eventId
              );


            if (eventData) {

              showEventForm(
                eventData
              );

            }

          }
        );

      });

  };


  // ==============================
  // VISTA DÍA
  // ==============================

  const renderDayView = (grid) => {


    const dayEvents =
      events.filter(event => {


        const eventDate =
          getDateFromFirestore(
            event.startDate
          );


        if (!eventDate) return false;


        return isSameDay(
          eventDate,
          currentDate
        );

      });


    let html = `

      <div class="day-view">

        <h3>

          ${currentDate.toLocaleDateString(
            'es-AR',
            {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            }
          )}

        </h3>

    `;


    if (dayEvents.length === 0) {


      html += `

        <p>
          No hay eventos para este día.
        </p>

      `;


    } else {


      dayEvents.forEach(event => {


        const eventDate =
          getDateFromFirestore(
            event.startDate
          );


        html += `

          <div class="calendar-event">

            <strong>
              ${event.title}
            </strong>


            <p>

              ${
                eventDate
                  ? formatTime(eventDate)
                  : ''
              }

            </p>


            <p>

              ${
                event.description || ''
              }

            </p>

          </div>

        `;

      });

    }


    html += `

      </div>

    `;


    grid.innerHTML = html;

  };


  // ==============================
  // VISTA SEMANA
  // ==============================

  const renderWeekView = (grid) => {


    const weekStart =
      startOfWeek(
        currentDate
      );


    const weekEnd =
      endOfWeek(
        currentDate
      );


    const days =
      eachDayOfInterval({

        start: weekStart,

        end: weekEnd

      });


    let html = `

      <div class="week-view">

    `;


    days.forEach(day => {


      const dayEvents =
        events.filter(event => {


          const eventDate =
            getDateFromFirestore(
              event.startDate
            );


          if (!eventDate) return false;


          return isSameDay(
            eventDate,
            day
          );

        });


      html += `

        <div class="week-day">

          <h4>

            ${day.toLocaleDateString(
              'es-AR',
              {
                weekday: 'long',
                day: 'numeric'
              }
            )}

          </h4>

      `;


      if (dayEvents.length === 0) {


        html += `

          <p>
            Sin eventos
          </p>

        `;


      } else {


        dayEvents.forEach(event => {

          html += `

            <div class="calendar-event">

              ${event.title}

            </div>

          `;

        });

      }


      html += `

        </div>

      `;

    });


    html += `

      </div>

    `;


    grid.innerHTML = html;

  };


  // ==============================
  // VISTA AÑO
  // ==============================

  const renderYearView = (grid) => {


    const year =
      currentDate.getFullYear();


    const months = [

      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre'

    ];


    let html = `

      <div class="year-view">

    `;


    months.forEach((monthName, index) => {


      html += `

        <div
          class="year-month"
          data-month="${index}"
        >

          <h3>

            ${monthName}

          </h3>

          <p>

            ${year}

          </p>

        </div>

      `;

    });


    html += `

      </div>

    `;


    grid.innerHTML = html;


    // Click en mes

    grid
      .querySelectorAll(
        '.year-month'
      )
      .forEach(month => {


        month.addEventListener(
          'click',
          () => {


            currentDate =
              new Date(

                year,

                Number(
                  month.dataset.month
                ),

                1

              );


            currentView =
              'month';


            // Actualizar botones
            container
              .querySelectorAll(
                '.view-selector button'
              )
              .forEach(button => {

                button.classList.remove(
                  'active'
                );

              });


            const monthButton =
              container.querySelector(
                '[data-view="month"]'
              );


            if (monthButton) {

              monthButton.classList.add(
                'active'
              );

            }


            refresh();

          }
        );

      });

  };


  // ==============================
  // FORMULARIO DE EVENTO
  // ==============================

  const showEventForm = (
    eventData = null
  ) => {


    const modal =
      document.createElement(
        'div'
      );


    modal.className =
      'modal-overlay';


    const startDate =
      eventData
        ? getDateFromFirestore(
            eventData.startDate
          )
        : null;


    const endDate =
      eventData
        ? getDateFromFirestore(
            eventData.endDate
          )
        : null;


    modal.innerHTML = `

      <div class="modal-content">


        <h3>

          ${
            eventData
              ? 'Editar Evento'
              : 'Nuevo Evento'
          }

        </h3>


        <form id="event-form">


          <div>

            <label>
              Título
            </label>


            <input
              type="text"
              id="event-title"

              value="${
                eventData?.title || ''
              }"

              required
            />

          </div>


          <div>

            <label>
              Descripción
            </label>


            <textarea
              id="event-description"
            >${
              eventData?.description || ''
            }</textarea>

          </div>


          <div>

            <label>
              Fecha inicio
            </label>


            <input

              type="datetime-local"

              id="event-start"

              value="${
                formatDateTimeLocal(
                  startDate
                )
              }"

              required

            />

          </div>


          <div>

            <label>
              Fecha fin
              (opcional)
            </label>


            <input

              type="datetime-local"

              id="event-end"

              value="${
                formatDateTimeLocal(
                  endDate
                )
              }"

            />

          </div>


          <button type="submit">

            ${
              eventData
                ? 'Actualizar'
                : 'Crear'
            }

          </button>


          <button
            type="button"
            id="cancel-modal"
          >

            Cancelar

          </button>


          ${
            eventData

              ? `

                <button
                  type="button"
                  id="delete-event"
                >

                  Eliminar

                </button>

              `

              : ''

          }


        </form>


      </div>

    `;


    document.body.appendChild(
      modal
    );


    const form =
      modal.querySelector(
        '#event-form'
      );


    // ==============================
    // GUARDAR EVENTO
    // ==============================

    form.addEventListener(
      'submit',
      async (event) => {


        event.preventDefault();


        const title =
          modal
            .querySelector(
              '#event-title'
            )
            .value
            .trim();


        const description =
          modal
            .querySelector(
              '#event-description'
            )
            .value
            .trim();


        const startDateInput =
          modal.querySelector(
            '#event-start'
          ).value;


        const endDateInput =
          modal.querySelector(
            '#event-end'
          ).value;


        const newStartDate =
          new Date(
            startDateInput
          );


        const newEndDate =
          endDateInput

            ? new Date(
                endDateInput
              )

            : null;


        // Validaciones

        if (!title) {

          alert(
            'El título es obligatorio'
          );

          return;

        }


        if (
          isNaN(
            newStartDate.getTime()
          )
        ) {

          alert(
            'La fecha de inicio es inválida'
          );

          return;

        }


        if (
          newEndDate &&
          newEndDate < newStartDate
        ) {

          alert(
            'La fecha de finalización no puede ser anterior a la fecha de inicio'
          );

          return;

        }


        const eventObj = {

          title,

          description,

          startDate:
            newStartDate,

          endDate:
            newEndDate

        };


        try {


          if (eventData) {


            await updateEvent(
              eventData.id,
              eventObj
            );


          } else {


            await createEvent(
              eventObj
            );


          }


          modal.remove();


          await refresh();


        } catch (error) {


          console.error(
            'Error guardando evento:',
            error
          );


          alert(

            'Error guardando evento: ' +
            error.message

          );

        }

      }
    );


    // ==============================
    // CANCELAR
    // ==============================

    modal
      .querySelector(
        '#cancel-modal'
      )
      .addEventListener(
        'click',
        () => {

          modal.remove();

        }
      );


    // ==============================
    // ELIMINAR
    // ==============================

    if (eventData) {


      modal
        .querySelector(
          '#delete-event'
        )
        .addEventListener(
          'click',
          async () => {


            const confirmDelete =
              confirm(
                '¿Seguro que querés eliminar este evento?'
              );


            if (!confirmDelete) {

              return;

            }


            try {


              await deleteEvent(
                eventData.id
              );


              modal.remove();


              await refresh();


            } catch (error) {


              console.error(
                'Error eliminando evento:',
                error
              );


              alert(

                'Error eliminando evento: ' +
                error.message

              );

            }

          }
        );

    }

  };


  // ==============================
  // DESTRUIR VISTA
  // ==============================

  const destroy = () => {


    // Si en el futuro agregamos
    // listeners globales,
    // podemos eliminarlos aquí.


  };


  // ==============================
  // INICIAR CALENDARIO
  // ==============================

  render();


const layout = createAppLayout(container, '#calendar');

return {
  render,
  destroy,
  element: layout.element
};

}
