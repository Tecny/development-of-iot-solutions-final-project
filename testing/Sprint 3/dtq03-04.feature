Feature: Ver y editar perfil de usuario

Como jugador o propietario autenticado quiero ver y editar mis datos personales para mantener mi información actualizada

Scenario: Acceder al perfil
	
	Given el usuario está autenticado
	When hace clic en el icono de perfil y selecciona "Perfil"
	Then la aplicación muestra la información de perfil del usuario

Scenario: Editar información de perfil

	Given el usuario está en la pantalla de perfil
	When hace clic en "Editar información"
	And modifica sus datos y hace clic en "Guardar"
	Then la aplicación actualiza la información del usuario