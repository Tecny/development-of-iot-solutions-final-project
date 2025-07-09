Feature: Registro de cuenta de usuario

Como jugador o propietario quiero registrarme para tener una cuenta en D'Taquito para poder acceder a funcionalidades protegidas

Scenario: Registro de cuenta exitoso

	Given el usuario se encuentra en la pantalla de registro de cuenta
	When ingresa nombre, correo electrónico, contraseña y rol válidos
	And hace clic en el botón "Registrarse"
	Then la aplicación crea la cuenta para el usuario

Scenario: Registro fallido por correo duplicado
	
	Given el usuario se encuentra en la pantalla de registro de cuenta
	When ingresa nombre, correo electrónico, contraseña y rol válidos
	And hace clic en el botón "Registrarse"
	Then la aplicación muestra un mensaje de error indicando que el correo ya está en uso