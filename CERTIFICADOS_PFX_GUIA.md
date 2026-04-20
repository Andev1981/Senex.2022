# Guía de Conversión de Certificados PFX (E-Cert / SII)

Esta guía detalla el procedimiento para convertir certificados digitales antiguos (Legacy) al estándar moderno **AES256**, necesario para que sean compatibles con **OpenSSL 3** (utilizado en PHP 8.1, 8.2, 8.3 y superiores).

## ¿Por qué es necesario?
Los certificados de proveedores como E-Cert o Acepta a menudo usan cifrados antiguos (TripleDES-SHA1) que OpenSSL 3 bloquea por seguridad. Este procedimiento los actualiza a **AES256-SHA256**, lo que garantiza su funcionamiento en cualquier servidor moderno (Laragon, Linux, Producción).

---

## Procedimiento de Conversión (Terminal de Laragon)

Realiza estos pasos cada vez que un certificado nuevo te dé el error `0308010C:unsupported`.

### 1. Extraer el contenido del certificado original
Este paso usa el modo "Legacy" para poder leer el archivo antiguo y generar un archivo temporal de texto (.pem).

```cmd
openssl pkcs12 -in "certificado_original.pfx" -legacy -nodes -out "temporal.pem"
```
*   **Import Password:** Ingresa la contraseña original del certificado.

### 2. Empaquetar en un PFX moderno (AES256)
Este paso toma el contenido extraído y lo guarda en un nuevo archivo binario (.pfx) usando el cifrado moderno que el sistema sí acepta.

```cmd
openssl pkcs12 -export -in "temporal.pem" -out "certificado_final.pfx" -keypbe AES-256-CBC -certpbe AES-256-CBC
```
*   **Export Password:** Ingresa la contraseña que deseas para el nuevo archivo (puede ser la misma de siempre).
*   **Verifying:** Repite la contraseña para confirmar.

### 3. Limpieza de seguridad (IMPORTANTE)
Borra el archivo temporal, ya que contiene tu llave privada sin cifrar.

```cmd
del temporal.pem
```

---

## Resultado Final
El archivo **`certificado_final.pfx`** es el que debes subir al sistema. 

**Ventajas:**
*   Compatible con el 100% de los servidores modernos.
*   No requiere tocar archivos de configuración del servidor (`openssl.cnf`).
*   Funciona tanto en desarrollo (Laragon) como en producción.
