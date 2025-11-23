import { useEffect, useState, useRef, useCallback, useMemo } from "react";
// Asumiendo que la ruta a logicaTablero es correcta desde aquí
import { calcularDistancia, calcularOndas as calcularOndasUtil } from './logicaTablero';
import { personajeService } from '../services/personajeService';
import { mapaService, plantillaService } from '../services/mapaService';

// Constantes reubicadas
const TOKEN_CENTER_OFFSET = 35; // Offset para el centro del token de Personaje (asumiendo 70px)
const ELEMENT_CENTER_OFFSET = 20; // Offset para el centro del token de Elemento (dado que tiene 40px)
const DEFAULT_GRID_SIZE_PX = 50; // Usado para convertir rango_activacion a píxeles

// Definición de tamaños del tooltip compacto (debe coincidir con Tablero.jsx)
const TOOLTIP_WIDTH = 120;
const TOOLTIP_HEIGHT = 100;

// Función auxiliar
const isObject = (element) => element.elementable_type && element.elementable_type.includes('Objeto');

export function useTablero() {
    // --- TODOS LOS ESTADOS (useState) ---
    const [personajes, setPersonajes] = useState([]);
    const [personajesEnTablero, setPersonajesEnTablero] = useState([]);
    const [selectedPersonajeId, setSelectedPersonajeId] = useState(null);
    const [objetivoPersonajeId, setObjetivoPersonajeId] = useState(null);
    const [modoAtaque, setModoAtaque] = useState(false);
    const [distancia, setDistancia] = useState(null);
    const [modoSeleccionMultiple, setModoSeleccionMultiple] = useState(false);
    const [seleccionMultipleIds, setSeleccionMultipleIds] = useState([]);
    const [personajeEnMovimientoId, setPersonajeEnMovimientoId] = useState(null);
    const [ondasIds, setOndasIds] = useState([]);
    const [menuCircular, setMenuCircular] = useState({ visible: false, personajeId: null, x: 0, y: 0, closing: false });
    const [bannerVisible, setBannerVisible] = useState(false);
    const [bannerClosing, setBannerClosing] = useState(false);
    const [attackerPulseKey, setAttackerPulseKey] = useState(null);
    const [isAvailableListOpen, setIsAvailableListOpen] = useState(true);

    // --- ESTADOS PARA OBJETOS DISPONIBLES Y ARRASTRE ---
    const [availableObjects, setAvailableObjects] = useState([]);
    const [isObjectListOpen, setIsObjectListOpen] = useState(false);
    const [isDraggingObject, setIsDraggingObject] = useState(false);
    const [draggedObject, setDraggedObject] = useState(null);
    const [objectSearchTerm, setObjectSearchTerm] = useState('');

    // --- ESTADOS PARA MAPAS DINÁMICOS ---
    const [availableMaps, setAvailableMaps] = useState([]);
    const [currentMap, setCurrentMap] = useState(null);
    const [isMapModalOpen, setIsMapModalOpen] = useState(false);
    const [isLoadingMaps, setIsLoadingMaps] = useState(true);

    // --- ESTADO PARA LOS ELEMENTOS DEL MAPA ---
    const [mapElements, setMapElements] = useState([]);

    // --- NUEVO ESTADO: Elemento de mapa seleccionado para interacción ---
    const [selectedElement, setSelectedElement] = useState(null);
    const [isElementInspectModalOpen, setIsElementInspectModalOpen] = useState(false);

    // --- NUEVO ESTADO PARA ONDAS DE ELEMENTOS ---
    const [activeElementOndas, setActiveElementOndas] = useState({});

    // --- ESTADO PARA EL TOOLTIP PERSONALIZADO ---
    const [activeTooltip, setActiveTooltip] = useState({
        visible: false,
        x: 0,
        y: 0,
        name: null,
        type: null,
        details: null
    });

    // --- ESTADOS PARA AÑADIR OBJETOS AL TABLERO ---
    const [modoAñadirObjeto, setModoAñadirObjeto] = useState(false);
    const [objetosDisponibles, setObjetosDisponibles] = useState([]);
    const [objetoSeleccionadoParaAñadir, setObjetoSeleccionadoParaAñadir] = useState(null);
    const [isObjetosListOpen, setIsObjetosListOpen] = useState(false);

    const mapaRef = useRef(null);

    // --- MEMOIZAR PERSONAJES ---
    const atacante = useMemo(() => personajesEnTablero.find((p) => p.id === selectedPersonajeId), [personajesEnTablero, selectedPersonajeId]);
    const objetivo = useMemo(() => personajesEnTablero.find((p) => p.id === objetivoPersonajeId), [personajesEnTablero, objetivoPersonajeId]);
    const personajesMultiple = useMemo(() => personajesEnTablero.filter((p) => seleccionMultipleIds.includes(p.id)), [personajesEnTablero, seleccionMultipleIds]);

    // --- FILTRAR OBJETOS POR BÚSQUEDA ---
    const filteredObjects = useMemo(() => {
        if (!objectSearchTerm.trim()) return availableObjects;

        // Función para normalizar texto (sin acentos ni mayúsculas)
        const normalizeText = (text) => {
            return text
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, ''); // Elimina los acentos
        };

        const searchNormalized = normalizeText(objectSearchTerm);

        return availableObjects.filter(obj => {
            const objNameNormalized = normalizeText(obj.denominacion);
            return objNameNormalized.includes(searchNormalized);
        });
    }, [availableObjects, objectSearchTerm]);

    // --- TODOS LOS useEffectS ---

    // 1. Carga Inicial de Personajes, Mapas y Objetos
    useEffect(() => {
        async function fetchInitialData() {
            try {
                const personajesData = await personajeService.getAll();
                setPersonajes(personajesData);
            } catch (error) {
                console.error("Error al cargar personajes", error);
            }

            setIsLoadingMaps(true);
            try {
                const mapsData = await mapaService.getAllMaps();
                setAvailableMaps(mapsData);
                if (mapsData.length > 0) {
                    setCurrentMap(mapsData[0]);
                }
            } catch (error) {
                console.error("Error al cargar mapas", error);
            } finally {
                setIsLoadingMaps(false);
            }

            // Cargar objetos disponibles
            try {
                const templates = await plantillaService.getAllTemplates();
                setAvailableObjects(templates.objects || []);
            } catch (error) {
                console.error("Error al cargar objetos disponibles", error);
            }
        }
        fetchInitialData();
    }, []);

    // 2. Carga de Elementos del Mapa
    useEffect(() => {
        async function fetchMapElements() {
            if (currentMap && currentMap.id) {
                try {
                    const elements = await mapaService.getMapElements(currentMap.id);
                    setMapElements(elements);
                } catch (error) {
                    console.error("Fallo al cargar los elementos del mapa:", error);
                    setMapElements([]);
                }
            } else {
                setMapElements([]);
            }
        }
        fetchMapElements();
    }, [currentMap]);

    // 3. Activación de Ondas de Elementos de Mapa
    useEffect(() => {
        const newActiveOndas = {};
        const gridSize = currentMap?.grid_size_px ?? DEFAULT_GRID_SIZE_PX;

        personajesEnTablero.forEach(personaje => {
            if (personaje.hp <= 0) return;

            mapElements.forEach(element => {
                const rangePx = (element.rango_activacion || 1) * gridSize;

                const dist = calcularDistancia(
                    { pos_x: personaje.pos_x + TOKEN_CENTER_OFFSET, pos_y: personaje.pos_y + TOKEN_CENTER_OFFSET },
                    { pos_x: element.pos_x + ELEMENT_CENTER_OFFSET, pos_y: element.pos_y + ELEMENT_CENTER_OFFSET }
                );

                if (dist <= rangePx) {
                    newActiveOndas[element.id] = {
                        characterId: personaje.id,
                        range: rangePx
                    };
                }
            });
        });

        setActiveElementOndas(newActiveOndas);
    }, [personajesEnTablero, mapElements, currentMap]);

    // 4. Banner Modo Ataque
    useEffect(() => {
        if (modoAtaque) {
            setBannerClosing(false);
            setBannerVisible(true);
        } else if (bannerVisible) {
            setBannerClosing(true);
            setTimeout(() => {
                setBannerVisible(false);
                setBannerClosing(false);
            }, 500);
        }
    }, [modoAtaque]);

    // 5. Ondas de Rango de Ataque
    useEffect(() => {
        if (!selectedPersonajeId) {
            setOndasIds([]);
            return;
        }
        const atacanteCheck = personajesEnTablero.find(p => p.id === selectedPersonajeId);
        if (!atacanteCheck) {
            setOndasIds([]);
            return;
        }
        const idsEnRango = calcularOndasUtil(personajesEnTablero, atacanteCheck.id, atacanteCheck.pos_x, atacanteCheck.pos_y);
        const timestamp = Date.now();
        const ondasConTimestamp = idsEnRango.map(id => ({ id: id, timestamp: timestamp }));
        setOndasIds(ondasConTimestamp);
    }, [selectedPersonajeId, personajesEnTablero]);

    // 6. Cálculo de Distancia
    useEffect(() => {
        if (modoAtaque && atacante && objetivo) {
            const dist = calcularDistancia(atacante, objetivo);
            setDistancia(dist.toFixed(2));
        } else {
            setDistancia(null);
        }
    }, [modoAtaque, atacante, objetivo]);

    // --- TODAS LAS FUNCIONES MANEJADORAS (usando useCallback para estabilidad) ---

    const cerrarMenuCircular = useCallback((force = false) => {
        if (!menuCircular.visible) return;
        if (force) {
            setMenuCircular({ visible: false, personajeId: null, x: 0, y: 0, closing: false });
            return;
        }
        setMenuCircular(prev => ({ ...prev, closing: true }));
        setTimeout(() => {
            setMenuCircular({ visible: false, personajeId: null, x: 0, y: 0, closing: false });
        }, 200);
    }, [menuCircular.visible]);

    const onStartDrag = useCallback((personajeId) => {
        setPersonajeEnMovimientoId(personajeId);
        cerrarMenuCircular(true);
    }, [cerrarMenuCircular]);

    const onStopDrag = useCallback(async (e, data, personajeId) => {
        const { x, y } = data;
        setPersonajeEnMovimientoId(null);
        const posXRedondeada = Math.round(x);
        const posYRedondeada = Math.round(y);

        setPersonajesEnTablero((prev) =>
            prev.map((p) =>
                p.id === personajeId ? { ...p, pos_x: posXRedondeada, pos_y: posYRedondeada } : p
            )
        );

        try {
            await personajeService.updatePosicion(personajeId, posXRedondeada, posYRedondeada);
        } catch (error) {
            console.error("Error actualizando posición", error);
        }
    }, []);

    const agregarAPersonajeEnTablero = useCallback((personaje) => {
        if (!personajesEnTablero.find((p) => p.id === personaje.id)) {
            const spawnX = currentMap?.spawn_x ?? 0;
            const spawnY = currentMap?.spawn_y ?? 0;

            setPersonajesEnTablero([...personajesEnTablero, {
                ...personaje,
                pos_x: spawnX,
                pos_y: spawnY,
            }]);
        }
    }, [personajesEnTablero, currentMap]);

    const toggleModoAtaque = useCallback(() => {
        if (!selectedPersonajeId) {
            console.error("Debes seleccionar un personaje para activar el modo ataque.");
            return;
        }

        setModoAtaque((v) => {
            const isEnteringAttackMode = !v;
            if (isEnteringAttackMode) {
                setAttackerPulseKey(Date.now());
            } else {
                setDistancia(null);
                setObjetivoPersonajeId(null);
            }
            return isEnteringAttackMode;
        });
        cerrarMenuCircular();
    }, [selectedPersonajeId, cerrarMenuCircular]);

    const seleccionarPersonaje = useCallback((personajeId) => {
        if (!modoSeleccionMultiple && !modoAtaque) {
            setSelectedPersonajeId(personajeId);
            setDistancia(null);
            setObjetivoPersonajeId(null);
            setSelectedElement(null);
        }
    }, [modoSeleccionMultiple, modoAtaque]);

    const manejarClickPersonajeEnAtaque = useCallback((objetivoId) => {
        if (modoAtaque && selectedPersonajeId !== null && objetivoId !== selectedPersonajeId) {
            setObjetivoPersonajeId(objetivoId);
        }
        cerrarMenuCircular();
    }, [modoAtaque, selectedPersonajeId, cerrarMenuCircular]);

    const manejarClickListaPersonaje = useCallback((personajeId) => {
        if (modoAtaque) {
            if (selectedPersonajeId === null) {
                setSelectedPersonajeId(personajeId);
                setObjetivoPersonajeId(null);
                setDistancia(null);
            } else if (personajeId !== selectedPersonajeId) {
                setObjetivoPersonajeId(personajeId);
            } else {
                setObjetivoPersonajeId(null);
                setDistancia(null);
            }
        } else if (!modoSeleccionMultiple) {
            setSelectedPersonajeId(personajeId);
            setDistancia(null);
            setObjetivoPersonajeId(null);
            setSelectedElement(null);
        }
        cerrarMenuCircular();
    }, [modoAtaque, selectedPersonajeId, modoSeleccionMultiple, cerrarMenuCircular]);

    const manejarClickTablero = useCallback((e) => {
        if (e.target === e.currentTarget) {
            if (modoSeleccionMultiple && e.type === "contextmenu") {
                e.preventDefault();
                setModoSeleccionMultiple(false);
                setSeleccionMultipleIds([]);
                setOndasIds([]);
                return;
            }
            if (!modoAtaque) {
                setSelectedPersonajeId(null);
                setObjetivoPersonajeId(null);
                setDistancia(null);
                setOndasIds([]);
                setSelectedElement(null);
            }
        }
        cerrarMenuCircular();
    }, [modoSeleccionMultiple, modoAtaque, cerrarMenuCircular]);

    const manejarClickDerechoPersonaje = useCallback((e, personaje) => {
        e.preventDefault();
        e.stopPropagation();

        if (modoAtaque) return;

        if (personaje.id === selectedPersonajeId && !modoSeleccionMultiple) {
            abrirMenuCircular(e, personaje);
        } else {
            if (!modoSeleccionMultiple) {
                setModoSeleccionMultiple(true);
                setSeleccionMultipleIds([personaje.id]);
                setSelectedPersonajeId(null);
                setObjetivoPersonajeId(null);
                setDistancia(null);
                setModoAtaque(false);
                setOndasIds([]);
                setSelectedElement(null);
            } else {
                setSeleccionMultipleIds((prev) =>
                    prev.includes(personaje.id)
                        ? prev.filter((id) => id !== personaje.id)
                        : [...prev, personaje.id]
                );
            }
        }
    }, [modoAtaque, selectedPersonajeId, modoSeleccionMultiple]);

    const abrirMenuCircular = useCallback((e, personaje) => {
        e.stopPropagation();
        if (menuCircular.visible && menuCircular.personajeId === personaje.id) {
            cerrarMenuCircular();
            return;
        }
        const x = personaje.pos_x + TOKEN_CENTER_OFFSET;
        const y = personaje.pos_y + TOKEN_CENTER_OFFSET;
        setMenuCircular({ visible: true, personajeId: personaje.id, x: x, y: y, closing: false });
    }, [menuCircular.visible, menuCircular.personajeId, cerrarMenuCircular]);

    const handleMenuOpcion = useCallback((opcion) => {
        const pj = personajesEnTablero.find(p => p.id === menuCircular.personajeId);
        console.log(`Has seleccionado "${opcion}" para ${pj.nombre}`);
        cerrarMenuCircular();
    }, [menuCircular.personajeId, personajesEnTablero, cerrarMenuCircular]);

    const handleStatChange = useCallback(async (e, personajeId, stat, cantidad) => {
        if (e) e.stopPropagation();

        const personaje = personajesEnTablero.find(p => p.id === personajeId);
        if (!personaje) return;

        const hpMax = personaje.hp_maximo || 10;
        const mpMax = personaje.mp_maximo || 10;
        const corduraMax = personaje.cordura_maxima || 99;

        let maxStat = 99;
        if (stat === 'hp') maxStat = hpMax;
        if (stat === 'mp') maxStat = mpMax;
        if (stat === 'cordura') maxStat = corduraMax;

        const currentValue = personaje[stat];
        let newValue = currentValue + cantidad;

        if (newValue < 0) newValue = 0;
        if (newValue > maxStat) newValue = maxStat;

        if (newValue === currentValue) return;

        setPersonajesEnTablero(prev =>
            prev.map(p =>
                p.id === personajeId ? { ...p, [stat]: newValue } : p
            )
        );

        try {
            await personajeService.updateStat(personajeId, stat, newValue);
        } catch (error) {
            console.error(`Error al actualizar ${stat}`, error);
            setPersonajesEnTablero(prev =>
                prev.map(p =>
                    p.id === personajeId ? { ...p, [stat]: currentValue } : p
                )
            );
        }
    }, [personajesEnTablero]);

    const handleResucitar = useCallback(async (e, personajeId) => {
        e.stopPropagation();
        const personaje = personajesEnTablero.find(p => p.id === personajeId);
        if (!personaje) return;
        const hpMax = personaje.hp_maximo || 10;
        setPersonajesEnTablero(prev =>
            prev.map(p =>
                p.id === personajeId ? { ...p, hp: hpMax } : p
            )
        );
        try {
            await personajeService.updateStat(personajeId, 'hp', hpMax);
        } catch (error) {
            console.error(`Error al resucitar`, error);
            setPersonajesEnTablero(prev =>
                prev.map(p =>
                    p.id === personajeId ? { ...p, hp: 0 } : p
                )
            );
        }
    }, [personajesEnTablero]);

    const handleEjecutarAtaque = useCallback(() => {
        if (!modoAtaque || !atacante || !objetivo) {
            console.error("Debes seleccionar un atacante y un objetivo válido.");
            return;
        }

        const isEnRango = ondasIds.some(onda => onda.id === objetivo.id);
        if (!isEnRango) {
            console.error(`${objetivo.nombre} está fuera de rango.`);
            return;
        }

        console.log(`Atacando a: ${objetivo.nombre}`);
        handleStatChange(null, objetivo.id, 'hp', -1);

        setObjetivoPersonajeId(null);
        setDistancia(null);
    }, [modoAtaque, atacante, objetivo, ondasIds, handleStatChange]);

    // --- HANDLERS DEL TOOLTIP PARA ELEMENTOS DE MAPA ---
    const handleElementMouseEnter = useCallback((e, element) => {
        if (!mapaRef.current) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const mapRect = mapaRef.current.getBoundingClientRect();

        const tokenCenterX = rect.left - mapRect.left + rect.width / 2;
        const tokenCenterY = rect.top - mapRect.top + rect.height / 2;

        const elementable = element.elementable || {};
        const type = element.elementable_type.split('\\').pop();

        setActiveTooltip({
            visible: true,
            // POSICIÓN: Sigue siendo a la derecha y abajo para objetos, ya que son distintos a personajes.
            x: tokenCenterX + 30,
            y: tokenCenterY - 60,

            name: elementable.denominacion || elementable.nombre || type,
            type: type,
            details: {
                pos_x: element.pos_x,
                pos_y: element.pos_y,
                rango: element.rango_activacion,
                valor: elementable.valor,
                descripcion: elementable.descripcion || elementable.notas_master || 'Sin descripción.',
                icon: isObject(element) ? '📦' : '📜',
            },
        });
    }, []);

    const handleElementMouseLeave = useCallback(() => {
        setActiveTooltip(prev => ({ ...prev, visible: false }));
    }, []);
    // --- FIN HANDLERS DEL TOOLTIP PARA ELEMENTOS DE MAPA ---

    // --- NUEVOS HANDLERS DEL TOOLTIP PARA PERSONAJES (CORREGIDO POSICIÓN) ---

    const handleCharacterMouseEnter = useCallback((e, personaje) => {
        if (!mapaRef.current) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const mapRect = mapaRef.current.getBoundingClientRect();

        const tokenCenterX = rect.left - mapRect.left + rect.width / 2;
        const tokenCenterY = rect.top - mapRect.top + rect.height / 2;

        // CÁLCULO DE POSICIÓN PARA CENTRAR EL TOOLTIP ARRIBA DEL TOKEN (Ancho 120px, Alto 100px)
        const x_pos = tokenCenterX - (TOOLTIP_WIDTH / 2); // Centrado horizontal
        const y_pos = tokenCenterY - TOOLTIP_HEIGHT - 10; // Elevado 10px sobre el token

        setActiveTooltip({
            visible: true,
            x: x_pos,
            y: y_pos,

            name: personaje.nombre,
            type: personaje.profesion || 'Aventurero',
            details: {
                pos_x: personaje.pos_x,
                pos_y: personaje.pos_y,
                hp: personaje.hp,
                hp_maximo: personaje.hp_maximo,
                mp: personaje.mp,
                mp_maximo: personaje.mp_maximo,
                cordura: personaje.cordura,
                cordura_maxima: personaje.cordura_maxima,
                icon: '👤',
            },
        });
    }, []);

    const handleCharacterMouseLeave = useCallback(() => {
        setActiveTooltip(prev => ({ ...prev, visible: false }));
    }, []);

    // --- FIN NUEVOS HANDLERS DEL TOOLTIP PARA PERSONAJES ---

    // --- FUNCIONALIDAD: INTERACCION CON ELEMENTOS ---

    const manejarClickElementoMapa = useCallback((e, element) => {
        e.stopPropagation();

        if (modoAtaque) {
            setModoAtaque(false);
            setDistancia(null);
            setObjetivoPersonajeId(null);
        }

        if (!selectedPersonajeId) {
            console.error("Debes seleccionar un personaje primero para interactuar.");
            return;
        }

        if (!isObject(element)) {
            console.log("Solo se puede interactuar con Objetos (Recoger).");
            return;
        }

        if (selectedElement && selectedElement.id === element.id) {
            setSelectedElement(null);
        } else {
            setSelectedElement(element);
        }
        cerrarMenuCircular();
    }, [modoAtaque, selectedPersonajeId, selectedElement, cerrarMenuCircular]);

    const handleInspeccionar = useCallback(() => {
        if (selectedElement) {
            setIsElementInspectModalOpen(true);
        }
    }, [selectedElement]);

    const handleRecoger = useCallback(async () => {
        if (selectedElement && selectedPersonajeId) {
            const character = personajesEnTablero.find(p => p.id === selectedPersonajeId);
            console.log(`[UI Action] ${character.nombre} intenta recoger ${selectedElement.elementable.denominacion}`);

            try {
                // 1. Llamada al API para añadir el objeto al inventario del personaje
                await personajeService.recogerObjeto(selectedPersonajeId, selectedElement.elementable.id, 1);
                console.log(`✅ ${selectedElement.elementable.denominacion} añadido al inventario de ${character.nombre}`);

                // 2. Eliminar el elemento del mapa de la base de datos
                await mapaService.deleteElement(selectedElement.id);
                console.log(`✅ Elemento eliminado del mapa (ID: ${selectedElement.id})`);

                // 3. Eliminar el elemento del estado local solo si todo salió bien
                setMapElements(prev => prev.filter(el => el.id !== selectedElement.id));

            } catch (error) {
                console.error('❌ Error al recoger objeto:', error);
                alert('Error al recoger el objeto. Inténtalo de nuevo.');
                return; // No eliminar del estado local si hubo error
            }

            setSelectedElement(null);
        }
    }, [selectedElement, selectedPersonajeId, personajesEnTablero]);

    // --- FUNCIONES PARA ARRASTRAR OBJETOS AL MAPA ---
    const handleObjectDragStart = useCallback((object) => {
        setIsDraggingObject(true);
        setDraggedObject(object);
        console.log(`[Drag Start] Arrastrando objeto: ${object.denominacion}`);
    }, []);

    const handleObjectDragEnd = useCallback(() => {
        setIsDraggingObject(false);
        setDraggedObject(null);
        console.log(`[Drag End] Fin del arrastre`);
    }, []);

    const handleMapDropObject = useCallback(async (e) => {
        if (!isDraggingObject || !draggedObject || !currentMap) return;

        const mapaRect = mapaRef.current.getBoundingClientRect();
        const pos_x = e.clientX - mapaRect.left;
        const pos_y = e.clientY - mapaRect.top;

        console.log(`[Drop] Soltando ${draggedObject.denominacion} en posición (${pos_x}, ${pos_y})`);

        try {
            const elementData = {
                elementable_type: 'App\\Models\\Objeto',
                elementable_id: draggedObject.id,
                pos_x: Math.round(pos_x),
                pos_y: Math.round(pos_y),
                rango_activacion: 1
            };

            const response = await mapaService.addElement(currentMap.id, elementData);

            if (response.success && response.elemento) {
                // Añadir el nuevo elemento al estado local
                setMapElements(prev => [...prev, response.elemento]);
                console.log(`✅ ${draggedObject.denominacion} añadido al mapa`);
            }
        } catch (error) {
            console.error('❌ Error al añadir objeto al mapa:', error);
            alert('Error al añadir el objeto al mapa. Inténtalo de nuevo.');
        } finally {
            handleObjectDragEnd();
        }
    }, [isDraggingObject, draggedObject, currentMap, mapaRef]);

    const mapImageUrl = currentMap?.imagen_url || '/mapa-default.jpg';

    // --- RETORNO DEL HOOK ---
    return {
        // Estados
        personajes,
        personajesEnTablero,
        selectedPersonajeId,
        objetivoPersonajeId,
        modoAtaque,
        distancia,
        modoSeleccionMultiple,
        seleccionMultipleIds,
        personajeEnMovimientoId,
        ondasIds,
        menuCircular,
        bannerVisible,
        bannerClosing,
        attackerPulseKey,
        isAvailableListOpen,
        availableMaps,
        currentMap,
        isMapModalOpen,
        isLoadingMaps,
        mapElements,
        selectedElement,
        isElementInspectModalOpen,
        activeElementOndas,
        activeTooltip,
        mapaRef,
        mapImageUrl,

        // Valores computados (memoizados)
        atacante,
        objetivo,
        personajesMultiple,

        // Estados para objetos disponibles
        availableObjects,
        filteredObjects,
        isObjectListOpen,
        isDraggingObject,
        draggedObject,
        objectSearchTerm,

        // Setters para la UI
        setModoSeleccionMultiple,
        setIsAvailableListOpen,
        setIsObjectListOpen,
        setObjectSearchTerm,
        setIsMapModalOpen,
        setCurrentMap,
        setIsElementInspectModalOpen,

        // Funciones (Handlers)
        onStartDrag,
        onStopDrag,
        agregarAPersonajeEnTablero,
        toggleModoAtaque,
        seleccionarPersonaje,
        manejarClickPersonajeEnAtaque,
        manejarClickListaPersonaje,
        manejarClickTablero,
        manejarClickDerechoPersonaje,
        cerrarMenuCircular,
        abrirMenuCircular,
        handleMenuOpcion,
        handleStatChange,
        handleResucitar,
        handleEjecutarAtaque,
        handleElementMouseEnter,
        handleElementMouseLeave,
        handleCharacterMouseEnter,
        handleCharacterMouseLeave,
        manejarClickElementoMapa,
        handleInspeccionar,
        handleRecoger,
        handleObjectDragStart,
        handleObjectDragEnd,
        handleMapDropObject,
        isObject
    };
}
