Feature: Gestión de créditos

Como jugador quiero recargar créditos para reservar espacios deportivos

Scenario: Recarga exitosa

	Given el jugador está autenticado
	When en perfil hace clic en "Recargar créditos"
	And escribe la cantidad deseada y paga con PayPal válido
	Then la recarga es exitosa y se actualiza el balance

Scenario: Recarga fallida

	Given el jugador está autenticado
	When en perfil hace clic en "Recargar créditos"
	And escribe la cantidad deseada y paga con PayPal inválido
	Then la aplicación muestra un error de pago