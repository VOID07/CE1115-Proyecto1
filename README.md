# CE1115-Proyecto1
Aplicación a utilizar para pruebas de seguridad.

## Prerequisitos:
Es necesario contar con una solución que permita admi contenedores, ya sea Docker o podman.
Además, es necesario instalar la versión compose de ambas herramientas para poder ejecutar ambos contenedores de manera simultánea.

En esta documentación se va a utilizar podman, pero es intercambiable con docker.Además se utiliza brew como administrador de paquetes.

1. Instalar [Brew](https://brew.sh)

``` sh
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

2. Instalar podman y podman-compose
```
brew install podman podman-compose
```

3. Instalar podman Desktop (opcional): https://podman-desktop.io/

4. Crear vm de podman (Se indica que no existe al ejecutar los siguientes comandos)

5. Construir la imagen de graphql y construir la imagen de podman compose.
```
podman build ./src/app && \
podman compose build
```

6. Ejecutar los contenedores utilizando podman compose
```
podman compose up -d
```

7. Verificar el estados de los contenedores, en caso de haber errores con `podman logs <container_name>`

8. La aplicación debería estar disponible en `http://localhost:4000/graphiql`

9. Para detener los contenedores, es posible realizarlo desde Podman Desktop, o utilizando el comando
```
podman compose down
```

### Requisitos adicionales
Para ejecutar correctamente los contenedores, es necesario crear un archivo `.env` en la raíz del proyecto con los siguienbtes valores:
``` sh
POSTGRES_USER=<custom_user>
POSTGRES_PASSWORD=<custom_password>
POSTGRES_DB=<custom_db_name>
```