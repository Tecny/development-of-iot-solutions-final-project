Feature: Tickets de transferencia

Como propietario o administrador quiero gestionar tickets de transferencia

Scenario: Ver tickets (propietario)

	Given el propietario autenticado
	When accede a "Tickets"
	Then muestra sus tickets de transferencia

Scenario: Crear ticket exitoso

	Given el propietario autenticado y sin ticket pendiente, en horario permitido
	When completa el formulario y confirma
	Then el ticket se crea correctamente

Scenario: Fallo al crear ticket
	
	Given el propietario autenticado con ticket pendiente o fuera de horario
	When intenta crear un ticket
	Then muestra un error correspondiente

Scenario: Confirmar y aplazar ticket (administrador)
	
	Given el administrador autenticado
	When en la pantalla de tickets hace clic en "Confirmar" o "Aplazar"
	Then el estado del ticket cambia correctamente