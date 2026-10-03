# Citroën Xsara Picasso (N68): notas de investigación

SQL: `citroen_xsara_picasso.sql` (generado con un script, SQL plano). Lo he validado con PGlite sobre el esquema `20261003081127_initial_schema.sql`, ejecutándolo dos veces seguidas para comprobar que es idempotente: 8 modelos, 141 tareas, 150 piezas, 14 referencias, 69 fuentes.

## Árbol

Hay una sola generación, **N68** (1999–2012). El restyling de 2004 mantiene el código N68. No lo he separado en otra fila porque la mecánica es la misma: el año de cada fila ya lo distingue.

| id | Motorización | Años (España) | Código motor | kW / CV | Combustible |
|---|---|---|---|---|---|
| `citroen-xsara-picasso-n68-16-88` | 1.6i 90 CV (88 CV) | 2000–2001 (km77: solo ene–jun 2000) | NFZ (TU5JP) | 65 / 88 | gasolina |
| `citroen-xsara-picasso-n68-16-95` | 1.6i 95 CV | 2000–2006 | NFV (TU5JP) | 70 / 95 | gasolina |
| `citroen-xsara-picasso-n68-16-16v-110` | 1.6i 16V 110 CV | 2005–2010 | NFU (TU5JP4) | 80 / 109 | gasolina |
| `citroen-xsara-picasso-n68-18-16v-115` | 1.8i 16V 115 CV | 2000–2006 | 6FZ (EW7J4) | 85 / 115 | gasolina |
| `citroen-xsara-picasso-n68-20-16v-136` | 2.0i 16V 136 CV automático (AL4) | 2003–2007 | RFN (EW10J4) | 100 / 136 | gasolina |
| `citroen-xsara-picasso-n68-20-hdi-90` | 2.0 HDi 90 CV | 2000–2006 | RHY (DW10TD) | 66 / 90 | diésel |
| `citroen-xsara-picasso-n68-16-hdi-90` | 1.6 HDi 90 CV (vendido como "HDi 92") | 2005–2011 | 9HX (DV6ATED4) | 66 / 90 | diésel, sin FAP |
| `citroen-xsara-picasso-n68-16-hdi-110-fap` | 1.6 HDi 110 CV FAP | 2004–2010 | 9HZ (DV6TED4; TecDoc también da 9HY) | 80 / 109 | diésel con FAP |

He dejado fuera estas variantes que aparecen en TecDoc pero no en la gama española de km77:
- 1.6 67 kW (91 CV) NFZ de 2002–2005.
- 1.6 16V GLP.
- 1.6 Chrono (DF-PSA, China).
- 2.0 RFN de 88 kW (120 CV) de 2004.

No hubo 2.0 HDi 110 en el Xsara Picasso.

## Plan por motorización: qué es de fabricante y qué no

**Común a todos:**
- **Líquido de frenos (24 meses):** `fabricante`. Viene del plan Citroën del Xsara Picasso (idgarages y RTA). Solo lo leí en las versiones gasolina, pero no depende del motor.
- **ITV:** `normativa`.
- **Aproximado** en todos los motores: frenos, neumáticos, escobillas, batería, embrague, correa de accesorios, caja de cambios y refrigerante. Para el refrigerante, Citroën solo pide revisar el nivel; he puesto revisarlo a los 5 años.

**1.6i 8V (NFZ 88 CV y NFV 95 CV).** `fabricante`, según el programa Citroën de RTA/Haynes, que coincide con idgarages:
- Aceite: 20.000 km o 12 meses.
- Filtro de aire: 60.000 km.
- Bujías: 60.000 km.
- Habitáculo: en cada revisión.
- **Distribución: 120.000 km o 10 años.**

El filtro de gasolina es `aproximado` (60.000 km): no encontré el plazo del fabricante.

**1.6i 16V (NFU).** `fabricante` (RTA/Haynes), con dos programas:
- Antes del OPR 11787: aceite cada 20.000 km o 1 año y distribución a 120.000 km o 10 años.
- Desde el OPR 11788 (16/02/2009): aceite cada 30.000 km o 2 años y distribución a 150.000 km o 10 años.

El esquema solo guarda un intervalo, así que he puesto el más prudente (20.000 km y 120.000 km) y explico la diferencia en `why`.

**1.8i 16V (EW7J4) y 2.0i 16V (EW10J4).**
- Aceite y habitáculo: `fabricante` (plan idgarages del Xsara Picasso), cada 20.000 km o 12 meses.
- **Distribución: `aproximado`, 120.000 km o 10 años.** Las fuentes no coinciden:
  - idgarages Xsara Picasso: 140.000 km o 120 meses.
  - idgarages Citroën C5 1.8 16V (mismo EW7): 120.000 km o 120 meses.
  - Mecazen: 120.000 km o 6 años.
  - Haynes UK no se pudo leer.
- Bujías y filtro de aire: `aproximado` (60.000 km, como en los TU5).
- 2.0 automático: aceite de la AL4 `aproximado`, cambio a 60.000 km o 4 años. Cararac dice 40.000 km o 48 meses; Citroën la vendía como "de por vida".

**2.0 HDi 90 (DW10TD).** `gemelo`, con los planes PSA del Peugeot 307 2.0 HDi 90 y del Citroën C5 2.0 HDi 90 (idgarages):
- Revisión cada 20.000 km o 24 meses.
- Filtros de aire y gasoil en la revisión grande de cada 60.000 km. Una ficha del 407 2.0 HDi (otro motor DW10) da 30.000 km para el filtro de gasoil; lo comento en `why`.
- **Distribución: 160.000 km o 10 años.** Coinciden el 307, el C5 y el foro de L'argus (este último con "5 años").
- No encontré el plan propio del Xsara Picasso HDi.

**1.6 HDi 110 FAP (DV6TED4).** `gemelo`, con los planes de los Peugeot 1007 y 407 1.6 HDi 110 FAP (idgarages):
- Revisión cada 20.000 km o 24 meses. Aceite obligatorio ACEA C2 / PSA B71 2290.
- Filtro de aire a 60.000 km.
- **Distribución: 240.000 km o 10 años.** Lo confirman el 1007, el 407 y Forum Peugeot, que cita el carnet y peugeot.fr.
- Filtro de gasoil: `aproximado`, 40.000 km. El 1007 dice 40.000 km y el 407, 60.000.
- **FAP + aditivo: `aproximado`, 120.000 km.** Una nota PSA (DAM 9492: Eolys 176/DPX10 sustituye al DPX42 y el plazo pasa de 80.000 a 120.000 km) aparece citada en un foro; no leí el documento original. La guía de aditivos de Bosal confirma que el Xsara Picasso de los OPR 09492 a 12165 usa Eolys 176. Por eso la pieza "Aditivo Eolys 176" está como `confirmado`.

**1.6 HDi 90 (DV6ATED4, sin FAP).** Mismo plan que el 110, pero sin la tarea FAP. La distribución a 240.000 km es `gemelo`, aunque el dato se ha leído en la versión 110. La correa (137 dientes, 25 mm) la saqué de Autodoc para el 9HX.

## Piezas

Solo hay referencias de marca donde las vi para esa motorización:
- TU5JP NFV, correa: GATES 5347XS, DAYCO 94331, BOSCH 1 987 949 146 (Autodoc).
- 1.8 16V, kit de distribución: INA 530 0238 10/30 (Schaeffler).
- 1.6 HDi 110, kit de distribución: INA 530 0375 10/30 (Schaeffler).
- 2.0 HDi: INA 530 0111 o 530 0470 (`comprobar`: hay dos según la serie).
- 2.0 16V: INA 530 0238 (`comprobar`: la ficha de Schaeffler es del RFN de 88 kW).

Filtros, bujías, pastillas, escobillas, batería y bombillas quedan sin referencias y como `comprobar`. La excepción son las luces de posición W5W y los neumáticos 185/65 R15 88H, que están confirmados para todas las motorizaciones.

`store_url` solo está puesto en las páginas de Autodoc (.co.uk) que pude abrir. Las de Autodoc.es no las pude comprobar porque la herramienta no me dejaba abrir URLs que no saliesen en un buscador. Para quien quiera completarlas, los ids TecDoc/Autodoc son:
- 11871: 1.6 65 kW
- 15472: 1.6 70 kW
- 19008: 1.6 16V
- 11872: 1.8 16V
- 17548: 2.0 16V
- 11873: 2.0 HDi
- 19010: 1.6 HDi 90
- 17961: 1.6 HDi 110

## Sin confirmar o fuera

- Plan oficial Citroën para las versiones diésel del propio Xsara Picasso: no lo encontré, así que usé gemelos PSA.
- Distribución de los EW (120.000 o 140.000 km).
- Plazo del filtro de gasoil del DV6 y del filtro de gasolina.
- Cambio del aceite de la caja AL4.
- Tipo de bombilla de los faros: no confirmado. Puede ser H4 o H7+H1 según la fase.
- Medidas de las escobillas y de la batería.
- Frenos traseros: tambor o disco según la versión.
- Capacidades de aceite: aproximadas (Cararac da rangos).
- Referencias de filtros, bujías y pastillas: no las añadí por no poder verificarlas por motor.

## Fuentes

- Haynes/RTA, carnet Xsara Picasso 1999-2011: https://fr-rta.haynes.com/pages/carnet-entretien-auto-citroen-xsara-picasso-1999-2011
- idgarages, Xsara Picasso: https://www.idgarages.com/fr-fr/entretien/citroen/carnet-entretien-citroen-xsara-picasso
- idgarages, Peugeot 307: https://www.idgarages.com/fr-fr/entretien/peugeot/carnet-entretien-peugeot-307
- idgarages, Citroën C5: https://www.idgarages.com/fr-fr/entretien/citroen/carnet-entretien-citroen-c5
- idgarages, Peugeot 1007: https://www.idgarages.com/fr-fr/entretien/peugeot/carnet-entretien-peugeot-1007
- idgarages, Peugeot 407: https://www.idgarages.com/fr-fr/entretien/peugeot/carnet-entretien-peugeot-407
- Forum Peugeot, distribución del 1.6 HDi 110: https://www.forum-peugeot.com/Forum/threads/courroie-de-distribution-pour-1-6-hdi-110.57223/
- Forum Peugeot, aditivo FAP: https://www.forum-peugeot.com/Forum/threads/additif-filtre-a-particules.86380/
- Bosal, guía Eolys: https://www.autoliagroup.com/wp-content/uploads/2019/10/BOSAL-TUTO-EOLYS.pdf
- L'argus, foro de correas: https://www.largus.fr/forum-auto/tutoriels-et-topics-de-reference/tuto-preconisations-changement-courroies-de-distribution/243826.html
- Mecazen: https://mecazen.fr/carnet-entretien-auto/citroen/xsara-picasso/probleme-de-courroie-distribution
- km77, gama española: https://www.km77.com/coches/citroen/xsara-picasso/2000/estandar
- Club Autodoc, neumáticos: https://club.autodoc.es/tyres/citroen/xsara/xsara-picasso-n68
- Der Ersatzteile-Profi, variantes TecDoc: https://www.der-ersatzteile-profi.de/citroen/xsara-picasso-n68/filter-g631
- Cararac, aceite motor: https://cararac.com/engine_oil/citroen/picasso.html
- Cararac, aceite de caja: https://cararac.com/gear_oil/citroen/xsara-picasso.html
- Catálogo Schaeffler: https://shop.rolling.hu/catalog/SCHAEFFLER/citroen-xsara-picasso-n68-18-16v, `-20`, `-20-hdi`, `-16-hdi`, `-16`
- Autodoc:
  - https://www.autodoc.co.uk/car-parts/timing-belt-10504/citroen/xsara/xsara-picasso-n68/15472-1-6
  - https://www.autodoc.co.uk/car-parts/timing-belt-set-10505/citroen/xsara/xsara-picasso-n68/19010-1-6-hdi
  - https://www.autodoc.co.uk/spares/citroen/xsara/xsara-picasso-n68/19008-1-6-16v
