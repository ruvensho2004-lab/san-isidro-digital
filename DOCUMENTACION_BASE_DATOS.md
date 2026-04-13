# Documentación Arquitectónica - Base de Datos (San Isidro Digital)

Este documento detalla la estructura y el modelo Entidad-Relación de la plataforma San Isidro Digital, manejada mediante Prisma ORM sobre una base de datos PostgreSQL.

## Enfoque Desacoplado

Las tablas y el sistema están diseñados de manera "Desacoplada" e independiente. Los módulos (Gas, Salud, Emprendimientos, etc.) operan insertando registros de forma auto-contenida con la cédula y otros datos personales.
Esto permite la adición directa de ciudadanos mediante números de cédula sin exigir que previamente hayan creado una cuenta en la aplicación oficial (Usuario), lo que facilita enormemente el empadronamiento de personas vulnerables y la gestión comunitaria rápida.

A continuación, el diagrama de Entidad-Relación generado con Mermaid:

```mermaid
erDiagram
    USUARIO {
        Int id PK
        String email "unique"
        String password
        String rol "admin/usuario"
        String cedula "unique"
        String nombre
        String apellido
        String telefono
        String direccion
        Boolean activo
        DateTime createdAt
    }

    SOLICITUD {
        Int id PK
        String nombre
        String cedula
        String telefono
        String tipo
        String descripcion
        String estado "Pendiente"
        DateTime fecha
        DateTime actualizado
    }

    RECURSOCLAP {
        Int id PK
        String nombre
        String cedula
        String tipo
        Int cantidad
        String observaciones
        String estado "Pendiente"
        Boolean pagado
        DateTime fecha
        DateTime actualizado
    }

    GASCOMUNAL {
        Int id PK
        String responsable
        String cedula
        String tamano "10Kg, 18Kg..."
        Int cantidad
        String estado "Pendiente, Entregado"
        Boolean pagado
        DateTime fecha
        DateTime actualizado
    }

    EMPRENDIMIENTO {
        Int id PK
        String nombre
        String cedula
        String responsable
        String categoria
        String descripcion
        Boolean cumpleRequisitos
        String estado "Pendiente"
        Decimal inversion
        DateTime fecha
        DateTime actualizado
    }

    CASOSALUD {
        Int id PK
        String paciente
        String cedula
        String diagnostico
        String ayudaReq
        String estado "Revisión"
        String prioridad "Normal, Alta..."
        DateTime fecha
        DateTime actualizado
    }

    ASAMBLEA {
        Int id PK
        String motivo
        DateTime fecha
        Int asistentes
        String acuerdos
        String vocero
        String enlaceActa
        DateTime actualizado
    }

    PROYECTO {
        Int id PK
        String titulo
        String descripcion
        String tipo
        String sector
        Decimal presupuesto
        String estado "En Planificación"
        DateTime fecha
        DateTime actualizado
    }

    NOTICIA {
        Int id PK
        String titulo
        String contenido
        String tipo "General, Asamblea..."
        Boolean activa
        DateTime fecha
        DateTime actualizado
    }

    BENEFICIARIO {
        Int id PK
        String nombre
        String cedula "unique"
        String telefono
        String direccion
        DateTime fecha
        DateTime actualizado
    }

    USUARIO ||--o{ SOLICITUD : "realiza (implícito)"
    USUARIO ||--o{ EMPRENDIMIENTO : "registra (implícito)"
    BENEFICIARIO ||--o{ CASOSALUD : "reportado en (implícito)"
    BENEFICIARIO ||--o{ RECURSOCLAP : "recibe (implícito)"
    BENEFICIARIO ||--o{ GASCOMUNAL : "recibe (implícito)"
```

### Notas sobre los Módulos
1. Módulo **CLAP:** Maneja cantidad, observaciones y estado del pago para facilitar el cobro y rastreo.
2. Módulo **Gas Comunal:** Adapta diferentes tamaños de cilindro (10Kg, 18Kg...) de manera fluida.
3. Módulo **Consultas (Beneficiario):** Guarda la directriz base del censo para verificar perfiles rápidamente.
