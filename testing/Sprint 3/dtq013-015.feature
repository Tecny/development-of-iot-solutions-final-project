Feature: Reservas y QR

Como jugador quiero gestionar mis reservas y generar códigos de acceso

Scenario: Ver mis reservas personales y comunidad

	Given el jugador autenticado
	When hace clic en "Mis reservas" y selecciona tipo
	Then muestra las reservas correspondientes

Scenario: Generar QR de acceso

	Given el jugador tiene una reserva activa
	When hace clic en "Generar QR de acceso"
	Then muestra el código QR generado