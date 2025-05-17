Feature: Suscripciones

Como propietario quiero ver y actualizar mi suscripción para gestionar mis beneficios

Scenario: Ver suscripción actual

	Given el propietario está autenticado
	When hace clic en "Suscripciones"
	Then la aplicación muestra el estado actual de la suscripción

Scenario: Actualizar suscripción exitosamente

	Given el propietario está en la pantalla de suscripciones
	When selecciona una opción y paga con PayPal válido
	Then la suscripción se actualiza correctamente

Scenario: Fallo al actualizar suscripción
	
	Given el propietario está en la pantalla de suscripciones
	When selecciona una opción y paga con PayPal inválido
	Then la aplicación muestra un error de actualización