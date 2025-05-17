Feature: Crear una reserva en un espacio deportivo

	Scenario: Creación exitosa de reserva personal
	
		Given el jugador está autenticado
		When está en la pantalla de reservas
		And selecciona horas de juego y tipo "Personal"
		And hace clic en "Confirmar"
		And tiene suficientes créditos
		Then la aplicación confirma la creación de la reserva


	Scenario: US13 - Creación fallida de reserva personal por crédito insuficiente
		
		Given el jugador está autenticado
		When está en la pantalla de reservas
		And selecciona horas de juego y tipo "Personal"
		And hace clic en "Confirmar"
		And no tiene suficientes créditos
		Then la aplicación muestra un mensaje indicando crédito insuficiente

	Scenario: US13 - Creación exitosa de reserva comunidad

		Given el jugador está autenticado
		When está en la pantalla de reservas
		And selecciona horas de juego y tipo "Comunidad"
		And hace clic en "Confirmar"
		And tiene suficientes créditos para adelanto
		Then la aplicación confirma la creación y crea una sala comunidad

	Scenario: US13 - Creación fallida de reserva comunidad por crédito insuficiente

		Given el jugador está autenticado
		When está en la pantalla de reservas
		And selecciona horas de juego y tipo "Comunidad"
		And hace clic en "Confirmar"
		And no tiene suficientes créditos para adelanto
		Then la aplicación muestra un mensaje indicando crédito insuficiente
