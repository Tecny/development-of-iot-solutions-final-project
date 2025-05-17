Feature: Gestión de espacios y reservas

Como jugador o propietario quiero ver, añadir, eliminar y reservar espacios deportivos

Scenario: Ver espacios (jugador)

	Given el usuario autenticado
	When hace clic en "Espacios deportivos"
	Then muestra todos los espacios disponibles

Scenario: Ver espacios (propietario)

	Given el propietario autenticado
	When hace clic en "Espacios deportivos"
	Then muestra sus espacios registrados

Scenario: Añadir espacio (lunes 00:00-06:00)

	Given el propietario autenticado
	When en "Espacios deportivos" hace clic en "Añadir espacio"
	And es lunes entre 00:00 y 06:00 horas
	Then puede completar el formulario y confirmar

Scenario: Fallo al añadir espacio fuera de horario

	Given el propietario autenticado
	When intenta añadir espacio fuera del horario
	Then la aplicación muestra un error de horario

Scenario: Eliminar espacio (lunes 00:00-06:00)

	Given el propietario autenticado
	When selecciona un espacio y confirma eliminación dentro del horario permitido
	Then el espacio se elimina correctamente

Scenario: Fallo al eliminar espacio fuera de horario

	Given el propietario autenticado
	When intenta eliminar espacio fuera del horario
	Then la aplicación muestra un error de horario

Scenario: Filtrar espacios deportivos

	Given el usuario autenticado
	When aplica filtros por deporte, distrito, precio u horario
	Then muestra los espacios que cumplen los criterios

Scenario: Ver horas disponibles

	Given el usuario autenticado
	When consulta más detalles de un espacio
	Then muestra las horas libres para reservar

Scenario: Crear reserva personal exitosa

	Given el jugador autenticado
	When selecciona horas y tipo "Personal" con créditos suficientes
	Then la reserva se crea correctamente

Scenario: Crear reserva personal fallida

	Given el jugador autenticado
	When selecciona horas y tipo "Personal" sin créditos suficientes
	Then la aplicación muestra un error por crédito insuficiente

Scenario: Crear reserva comunidad exitosa

	Given el jugador autenticado
	When selecciona horas y tipo "Comunidad" con crédito de adelanto suficiente
	Then la reserva y sala comunidad se crean correctamente

Scenario: Crear reserva comunidad fallida

	Given el jugador autenticado
	When selecciona horas y tipo "Comunidad" sin crédito suficiente
	Then la aplicación muestra un error por crédito insuficiente