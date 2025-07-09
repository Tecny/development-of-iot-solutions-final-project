Feature: Inicio de sesión de cuenta
Como jugador o propietario quiero iniciar sesión en mi cuenta para acceder a la plataforma

Scenario: Inicio de sesión exitoso

	Given el usuario está en la pantalla de inicio de sesión
	When escribe correo y contraseña válidos
	And hace clic en el botón "Iniciar sesión"
	Then la aplicación lleva al usuario a la página principal

Scenario: Inicio de sesión fallido
	
	Given el usuario está en la pantalla de inicio de sesión
	When escribe correo o contraseña incorrectos
	And hace clic en el botón "Iniciar sesión"
	Then la aplicación muestra un mensaje de error por credenciales inválidas