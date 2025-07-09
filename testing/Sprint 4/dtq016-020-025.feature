Feature: Salas comunidad

Como jugador o propietario quiero ver, unirme, salir y filtrar salas comunidad

Scenario: Ver salas comunidad disponibles

	Given el jugador autenticado
	When hace clic en "Salas comunidad"
	Then muestra todas las salas disponibles

Scenario: Unirse a sala exitosa
	
	Given el jugador autenticado con crédito suficiente
	When hace clic en "Unirse"
	Then se une correctamente a la sala

Scenario: Fallo al unirse por crédito insuficiente

	Given el jugador autenticado sin crédito suficiente
	When hace clic en "Unirse"
	Then muestra un error por crédito insuficiente

Scenario: Salir de sala con >24h restantes

	Given el jugador autenticado
	When en sala comunitaria falta más de 24h para el inicio
	Then se sale correctamente y recibe devolución de adelanto

Scenario: Eliminar sala (creador) con >1h antes

	Given el creador autenticado
	When en su sala falta más de 1h para el inicio y confirma eliminación
	Then la sala se elimina y se devuelve el adelanto

Scenario: Filtrar salas comunidad

	Given el jugador autenticado
	When aplica filtros por deporte, fecha, horario o adelanto
	Then muestra salas que cumplen los criterios