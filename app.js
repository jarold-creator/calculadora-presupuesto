class PresupuestoApp {
    constructor() {
        this.transacciones = [];
        this.chart = null;
        this.perfilesKey = 'presupuesto_perfiles';
        this.perfilActivoKey = 'presupuesto_perfil_activo';
        this.themeKey = 'presupuesto_tema';
        this.paginaActual = 1;
        this.itemsPorPagina = 10;
        this.ordenActual = 'amount-desc';

        this.init();
    }

    init() {
        this.inicializarPerfiles();
        this.cargarDatos();
        this.inicializarChart();
        this.configurarEventos();
        this.configurarTema();
        this.renderizar();
        this.renderizarSelectorPerfil();
    }

    inicializarPerfiles() {
        const perfiles = this.obtenerPerfiles();
        if (perfiles.length === 0) {
            const primerPerfil = 'Mi Perfil';
            localStorage.setItem(this.perfilesKey, JSON.stringify([primerPerfil]));
            localStorage.setItem(this.perfilActivoKey, primerPerfil);
        }
    }

    leerJson(clave, valorPorDefecto) {
        try {
            const datos = localStorage.getItem(clave);
            return datos ? JSON.parse(datos) : valorPorDefecto;
        } catch (error) {
            return valorPorDefecto;
        }
    }

    obtenerPerfiles() {
        const perfiles = this.leerJson(this.perfilesKey, []);
        return Array.isArray(perfiles) ? perfiles : [];
    }

    escaparHtml(texto) {
        return String(texto ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    obtenerPerfilActivo() {
        return localStorage.getItem(this.perfilActivoKey) || 'Mi Perfil';
    }

    getStorageKeyPerfil() {
        return `presupuesto_datos_${this.obtenerPerfilActivo()}`;
    }

    cargarDatos() {
        const datos = this.leerJson(this.getStorageKeyPerfil(), []);
        this.transacciones = Array.isArray(datos) ? datos : [];
    }

    guardarDatos() {
        localStorage.setItem(this.getStorageKeyPerfil(), JSON.stringify(this.transacciones));
    }

    configurarTema() {
        const savedTheme = localStorage.getItem(this.themeKey);
        if (savedTheme === 'light') {
            document.body.classList.add('light');
            this.actualizarIconoTema();
        }

        this.actualizarTemaGrafico();

        const themeToggle = document.getElementById('theme-toggle');
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('light');
            const isLight = document.body.classList.contains('light');
            localStorage.setItem(this.themeKey, isLight ? 'light' : 'dark');
            this.actualizarIconoTema();
            this.actualizarTemaGrafico();
        });
    }

    actualizarTemaGrafico() {
        if (!this.chart) return;

        const esClaro = document.body.classList.contains('light');
        this.chart.options.plugins.legend.labels.color = esClaro ? '#52525b' : '#a1a1aa';
        this.chart.update('none');
    }

    actualizarIconoTema() {
        const sunIcon = document.getElementById('sun-icon');
        const moonIcon = document.getElementById('moon-icon');
        if (document.body.classList.contains('light')) {
            sunIcon.classList.remove('hidden');
            moonIcon.classList.add('hidden');
        } else {
            sunIcon.classList.add('hidden');
            moonIcon.classList.remove('hidden');
        }
    }

    renderizarSelectorPerfil() {
        const container = document.getElementById('profile-selector');
        const perfiles = this.obtenerPerfiles();
        const activo = this.obtenerPerfilActivo();

        container.innerHTML = `
            <div class="relative inline-block">
                <button id="profile-btn" type="button" class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-elevated transition-all border border-transparent hover:border-border" aria-haspopup="true" aria-expanded="false" aria-controls="profile-dropdown">
                    <svg class="w-5 h-5 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                    <span class="font-medium text-sm">${this.escaparHtml(activo)}</span>
                    <svg class="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                </button>
                <div id="profile-dropdown" class="hidden absolute right-0 mt-2 w-64 bg-surface border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
                    <div class="p-3 border-b border-border">
                        <p class="text-xs font-medium text-text-secondary uppercase tracking-wider">Mis Perfiles</p>
                    </div>
                    <div class="p-2 max-h-64 overflow-y-auto">
                        ${perfiles.map((p, index) => `
                            <div class="flex items-center justify-between group rounded-lg hover:bg-surface-elevated transition-all ${p === activo ? 'bg-surface-elevated' : ''}">
                                <button type="button" data-profile-index="${index}" class="flex-1 text-left px-3 py-2.5 ${p === activo ? 'text-info font-medium' : ''}">
                                    ${this.escaparHtml(p)}
                                    ${p === activo ? '<span class="text-xs text-info ml-2">● Activo</span>' : ''}
                                </button>
                                ${perfiles.length > 1 ? `
                                    <button type="button" data-delete-profile-index="${index}" class="opacity-0 group-hover:opacity-100 focus:opacity-100 p-2 text-text-secondary hover:text-expense transition-all" aria-label="Eliminar perfil ${this.escaparHtml(p)}" title="Eliminar perfil">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                        </svg>
                                    </button>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                    <div class="p-2 border-t border-border">
                        <button type="button" id="create-profile-btn" class="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-surface-elevated transition-all text-income font-medium">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                            </svg>
                            Crear nuevo perfil
                        </button>
                    </div>
                </div>
            </div>
        `;

        const btn = document.getElementById('profile-btn');
        const dropdown = document.getElementById('profile-dropdown');

        btn.addEventListener('click', () => {
            const oculto = dropdown.classList.toggle('hidden');
            btn.setAttribute('aria-expanded', String(!oculto));
        });

        container.querySelectorAll('[data-profile-index]').forEach((boton) => {
            boton.addEventListener('click', () => {
                const perfil = perfiles[Number(boton.dataset.profileIndex)];
                if (perfil !== undefined) this.cambiarPerfil(perfil);
            });
        });

        container.querySelectorAll('[data-delete-profile-index]').forEach((boton) => {
            boton.addEventListener('click', () => {
                const perfil = perfiles[Number(boton.dataset.deleteProfileIndex)];
                if (perfil !== undefined) this.confirmarEliminarPerfil(perfil);
            });
        });

        document.getElementById('create-profile-btn').addEventListener('click', () => {
            this.mostrarCrearPerfil();
        });
    }

    confirmarEliminarPerfil(nombre) {
        const perfiles = this.obtenerPerfiles();
        if (perfiles.length <= 1) {
            this.mostrarToast('No puedes eliminar el único perfil', 'warning');
            return;
        }

        const focoPrevio = document.activeElement;
        document.getElementById('profile-dropdown').classList.add('hidden');
        document.getElementById('profile-btn').setAttribute('aria-expanded', 'false');

        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 modal-backdrop';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'delete-profile-title');
        modal.innerHTML = `
            <div class="bg-surface rounded-xl p-6 border border-border shadow-xl w-full max-w-sm">
                <div class="flex items-center gap-4 mb-4">
                    <div class="w-12 h-12 rounded-full bg-expense/20 flex items-center justify-center">
                        <svg class="w-6 h-6 text-expense" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                        </svg>
                    </div>
                    <div>
                        <h3 id="delete-profile-title" class="text-lg font-semibold">Eliminar Perfil</h3>
                        <p class="text-sm text-text-secondary">Esta acción no se puede deshacer</p>
                    </div>
                </div>
                <p class="text-text-secondary mb-6">¿Estás seguro de eliminar el perfil "<strong>${this.escaparHtml(nombre)}</strong>"? Se perderán todos los datos asociados.</p>
                <div class="flex gap-3">
                    <button type="button" class="cancel-delete-profile flex-1 bg-surface-elevated hover:bg-border text-text-primary font-semibold py-3 rounded-lg transition-all">
                        Cancelar
                    </button>
                    <button type="button" class="confirm-delete-profile flex-1 bg-red-700 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition-all">
                        Eliminar
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        const cerrar = () => {
            modal.remove();
            document.removeEventListener('keydown', alPresionarTecla);
            if (focoPrevio && typeof focoPrevio.focus === 'function') focoPrevio.focus();
        };

        const alPresionarTecla = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                cerrar();
            } else if (e.key === 'Tab') {
                this.mantenerFocoEnModal(modal, e);
            }
        };

        modal.querySelector('.cancel-delete-profile').addEventListener('click', cerrar);
        modal.querySelector('.confirm-delete-profile').addEventListener('click', () => {
            modal.remove();
            document.removeEventListener('keydown', alPresionarTecla);
            this.eliminarPerfil(nombre);
        });
        modal.addEventListener('click', (e) => {
            if (e.target === modal) cerrar();
        });
        document.addEventListener('keydown', alPresionarTecla);
        modal.querySelector('.cancel-delete-profile').focus();
    }

    mantenerFocoEnModal(modal, evento) {
        const enfocables = Array.from(modal.querySelectorAll(
            'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )).filter((elemento) => elemento.offsetParent !== null);

        if (enfocables.length === 0) return;

        const primero = enfocables[0];
        const ultimo = enfocables[enfocables.length - 1];
        const activo = document.activeElement;

        if (evento.shiftKey && (activo === primero || !modal.contains(activo))) {
            evento.preventDefault();
            ultimo.focus();
        } else if (!evento.shiftKey && (activo === ultimo || !modal.contains(activo))) {
            evento.preventDefault();
            primero.focus();
        }
    }

    cambiarPerfil(nombre) {
        localStorage.setItem(this.perfilActivoKey, nombre);
        this.paginaActual = 1;
        this.cargarDatos();
        this.renderizar();
        this.renderizarSelectorPerfil();
        this.mostrarToast(`Cambiado a ${nombre}`, 'success');
    }

    crearPerfil(nombre) {
        if (!nombre || nombre.trim() === '') {
            this.mostrarToast('Ingresa un nombre', 'error');
            return;
        }

        const perfiles = this.obtenerPerfiles();
        if (perfiles.includes(nombre)) {
            this.mostrarToast('El perfil ya existe', 'error');
            return;
        }

        perfiles.push(nombre);
        localStorage.setItem(this.perfilesKey, JSON.stringify(perfiles));
        this.cambiarPerfil(nombre);
    }

    eliminarPerfil(nombre) {
        const perfiles = this.obtenerPerfiles();
        if (perfiles.length <= 1) {
            this.mostrarToast('No puedes eliminar el último perfil', 'error');
            return;
        }

        localStorage.removeItem(`presupuesto_datos_${nombre}`);
        const nuevosPerfiles = perfiles.filter(p => p !== nombre);
        localStorage.setItem(this.perfilesKey, JSON.stringify(nuevosPerfiles));

        const activo = this.obtenerPerfilActivo();
        if (nombre === activo) {
            localStorage.setItem(this.perfilActivoKey, nuevosPerfiles[0]);
            this.paginaActual = 1;
        }

        this.cargarDatos();
        this.renderizar();
        this.renderizarSelectorPerfil();
        this.mostrarToast('Perfil eliminado', 'success');
    }

    mostrarCrearPerfil() {
        this.focoPrevioCrearPerfil = document.activeElement;
        document.getElementById('profile-dropdown').classList.add('hidden');
        document.getElementById('profile-btn').setAttribute('aria-expanded', 'false');
        document.getElementById('new-profile-name').value = '';
        document.getElementById('create-profile-modal').classList.remove('hidden');
        document.getElementById('create-profile-modal').classList.add('flex');
        document.getElementById('create-profile-modal').querySelector('.bg-surface').classList.add('animate-scale-in');
        setTimeout(() => document.getElementById('new-profile-name').focus(), 50);
    }

    cerrarModalCrearPerfil() {
        const modalContent = document.getElementById('create-profile-modal').querySelector('.bg-surface');
        modalContent.classList.remove('animate-scale-in');
        modalContent.classList.add('animate-scale-out');
        setTimeout(() => {
            document.getElementById('create-profile-modal').classList.add('hidden');
            document.getElementById('create-profile-modal').classList.remove('flex');
            modalContent.classList.remove('animate-scale-out');
            if (this.focoPrevioCrearPerfil) {
                this.focoPrevioCrearPerfil.focus();
                this.focoPrevioCrearPerfil = null;
            }
        }, 200);
    }

    guardarNuevoPerfil(e) {
        e.preventDefault();
        const nombre = document.getElementById('new-profile-name').value.trim();
        if (nombre) {
            this.crearPerfil(nombre);
            this.cerrarModalCrearPerfil();
        }
    }

    configurarEventos() {
        const form = document.getElementById('transaction-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.agregarTransaccion();
        });

        const montoInput = document.getElementById('monto');
        let isFormatting = false;
        
        montoInput.addEventListener('input', (e) => {
            if (isFormatting) return;
            isFormatting = true;
            
            const rawValue = e.target.value.replace(/[^\d]/g, '');
            e.target.setAttribute('data-raw', rawValue);
            
            if (rawValue) {
                const formatted = parseInt(rawValue, 10).toLocaleString('es-CO');
                const cursorPos = e.target.selectionStart;
                const oldLength = e.target.value.length;
                e.target.value = formatted;
                const newLength = e.target.value.length;
                const newPos = cursorPos + (newLength - oldLength);
                e.target.setSelectionRange(newPos, newPos);
            }
            
            isFormatting = false;
        });

        montoInput.addEventListener('blur', (e) => {
            const raw = e.target.getAttribute('data-raw');
            if (raw && raw.length > 0) {
                e.target.value = parseInt(raw, 10).toLocaleString('es-CO');
            }
        });

        montoInput.addEventListener('focus', (e) => {
            const raw = e.target.getAttribute('data-raw');
            if (raw) {
                e.target.value = raw;
                setTimeout(() => e.target.setSelectionRange(e.target.value.length, e.target.value.length), 0);
            }
        });

        montoInput.closest('form').addEventListener('submit', (e) => {
            const raw = montoInput.getAttribute('data-raw');
            if (raw && raw.length > 0) {
                montoInput.value = parseInt(raw, 10).toLocaleString('es-CO');
            }
        });

        const reiniciarBtn = document.getElementById('reiniciar-mes');
        reiniciarBtn.addEventListener('click', () => {
            this.reiniciarMes();
        });

        const sortSelect = document.getElementById('sort-select');
        sortSelect.value = this.ordenActual;
        sortSelect.addEventListener('change', (e) => {
            this.ordenActual = e.target.value;
            this.paginaActual = 1;
            this.renderizarTabla();
        });

        const editForm = document.getElementById('edit-form');
        editForm.addEventListener('submit', (e) => {
            this.guardarEdicion(e);
        });

        const cancelEditBtn = document.getElementById('cancel-edit');
        cancelEditBtn.addEventListener('click', () => {
            this.cerrarModalEdicion();
        });

        const editModal = document.getElementById('edit-modal');
        editModal.addEventListener('click', (e) => {
            if (e.target === editModal) {
                this.cerrarModalEdicion();
            }
        });
        editModal.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                this.cerrarModalEdicion();
            } else if (e.key === 'Tab') {
                this.mantenerFocoEnModal(editModal, e);
            }
        });

        const editMontoInput = document.getElementById('edit-monto');
        let isEditing = false;
        
        editMontoInput.addEventListener('input', (e) => {
            if (isEditing) return;
            isEditing = true;
            
            const rawValue = e.target.value.replace(/[^\d]/g, '');
            e.target.setAttribute('data-raw', rawValue);
            
            if (rawValue) {
                const formatted = parseInt(rawValue, 10).toLocaleString('es-CO');
                const cursorPos = e.target.selectionStart;
                const oldLength = e.target.value.length;
                e.target.value = formatted;
                const newLength = e.target.value.length;
                const newPos = cursorPos + (newLength - oldLength);
                e.target.setSelectionRange(newPos, newPos);
            }
            
            isEditing = false;
        });

        editMontoInput.addEventListener('blur', (e) => {
            const raw = e.target.getAttribute('data-raw');
            if (raw && raw.length > 0) {
                e.target.value = parseInt(raw, 10).toLocaleString('es-CO');
            }
        });

        editMontoInput.addEventListener('focus', (e) => {
            const raw = e.target.getAttribute('data-raw');
            if (raw) {
                e.target.value = raw;
                setTimeout(() => e.target.setSelectionRange(e.target.value.length, e.target.value.length), 0);
            }
        });

        const createProfileForm = document.getElementById('create-profile-form');
        createProfileForm.addEventListener('submit', (e) => {
            this.guardarNuevoPerfil(e);
        });

        const cancelCreateProfileBtn = document.getElementById('cancel-create-profile');
        cancelCreateProfileBtn.addEventListener('click', () => {
            this.cerrarModalCrearPerfil();
        });

        const createProfileModal = document.getElementById('create-profile-modal');
        createProfileModal.addEventListener('click', (e) => {
            if (e.target === createProfileModal) {
                this.cerrarModalCrearPerfil();
            }
        });
        createProfileModal.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                this.cerrarModalCrearPerfil();
            } else if (e.key === 'Tab') {
                this.mantenerFocoEnModal(createProfileModal, e);
            }
        });

        const tbody = document.getElementById('transactions-table');
        tbody.addEventListener('change', (e) => {
            const checkbox = e.target.closest('input[data-action="toggle-paid"]');
            if (checkbox) {
                this.togglePagado(Number(checkbox.dataset.id));
            }
        });
        tbody.addEventListener('click', (e) => {
            const editar = e.target.closest('button[data-action="editar"]');
            if (editar) {
                this.editarTransaccion(Number(editar.dataset.id));
                return;
            }

            const eliminar = e.target.closest('button[data-action="eliminar"]');
            if (eliminar) {
                this.eliminarTransaccion(Number(eliminar.dataset.id));
            }
        });

        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('profile-dropdown');
            const btn = document.getElementById('profile-btn');
            if (!dropdown || !btn || dropdown.classList.contains('hidden')) return;

            if (!btn.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.add('hidden');
                btn.setAttribute('aria-expanded', 'false');
            }
        });
    }

    agregarTransaccion() {
        const montoInput = document.getElementById('monto');
        const montoValue = montoInput.value.replace(/\./g, '').replace(/,/g, '');
        const monto = parseFloat(montoValue);

        const descripcion = document.getElementById('descripcion').value.trim();
        const categoria = document.getElementById('categoria').value;
        const tipo = document.querySelector('input[name="tipo"]:checked').value;

        if (!descripcion || isNaN(monto) || monto <= 0 || !categoria) {
            this.mostrarToast('Por favor completa todos los campos correctamente', 'error');
            return;
        }

        if (montoValue) {
            montoInput.value = parseInt(montoValue, 10).toLocaleString('es-CO');
            montoInput.setAttribute('data-raw', montoValue);
        }

        const transaccion = {
            id: Date.now(),
            descripcion,
            monto,
            categoria,
            tipo,
            fecha: new Date().toISOString(),
            pagado: false
        };

        this.transacciones.unshift(transaccion);
        this.guardarDatos();
        this.limpiarFormulario();
        this.renderizar();
        this.mostrarToast('Transacción agregada', 'success');
    }

    eliminarTransaccion(id) {
        const transaccion = this.transacciones.find(t => t.id === id);
        if (!transaccion) return;

        const descripcion = this.escaparHtml(this.truncarTexto(transaccion.descripcion, 40));
        this.mostrarModalConfirmacion(
            'Eliminar Transacción',
            `¿Estás seguro de eliminar "${descripcion}" por ${this.formatearMonto(transaccion.monto)}?`,
            () => {
                this.transacciones = this.transacciones.filter(t => t.id !== id);
                this.guardarDatos();
                this.renderizar();
                this.mostrarToast('Transacción eliminada', 'error');
            }
        );
    }

    mostrarModalConfirmacion(titulo, mensaje, onConfirm) {
        const focoPrevio = document.activeElement;
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 modal-backdrop';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'confirm-modal-title');
        modal.innerHTML = `
            <div class="bg-surface rounded-xl p-6 border border-border shadow-xl w-full max-w-sm animate-scale-in">
                <div class="flex items-center gap-4 mb-4">
                    <div class="w-12 h-12 rounded-full bg-expense/20 flex items-center justify-center flex-shrink-0">
                        <svg class="w-6 h-6 text-expense" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                        </svg>
                    </div>
                    <div>
                        <h3 id="confirm-modal-title" class="text-lg font-semibold">${titulo}</h3>
                    </div>
                </div>
                <p class="text-text-secondary mb-6">${mensaje}</p>
                <div class="flex gap-3">
                    <button type="button" class="cancel-confirm flex-1 bg-surface-elevated hover:bg-border text-text-primary font-semibold py-3 rounded-lg transition-all btn-hover">
                        Cancelar
                    </button>
                    <button type="button" class="confirm-delete flex-1 bg-red-700 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition-all btn-hover">
                        Eliminar
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        const cerrar = () => {
            modal.remove();
            document.removeEventListener('keydown', alPresionarTecla);
            if (focoPrevio && typeof focoPrevio.focus === 'function') focoPrevio.focus();
        };

        const alPresionarTecla = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                cerrar();
            } else if (e.key === 'Tab') {
                this.mantenerFocoEnModal(modal, e);
            }
        };

        modal.querySelector('.cancel-confirm').addEventListener('click', cerrar);

        modal.querySelector('.confirm-delete').addEventListener('click', () => {
            modal.remove();
            document.removeEventListener('keydown', alPresionarTecla);
            onConfirm();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) cerrar();
        });
        document.addEventListener('keydown', alPresionarTecla);
        modal.querySelector('.cancel-confirm').focus();
    }

    limpiarFormulario() {
        document.getElementById('descripcion').value = '';
        const montoInput = document.getElementById('monto');
        montoInput.value = '';
        montoInput.removeAttribute('data-raw');
        document.getElementById('categoria').value = '';
        document.querySelector('input[name="tipo"]:checked').checked = false;
        document.querySelector('input[name="tipo"][value="ingreso"]').checked = true;
    }

    togglePagado(id) {
        const transaccion = this.transacciones.find(t => t.id === id);
        if (transaccion) {
            transaccion.pagado = !transaccion.pagado;
            this.guardarDatos();
            this.renderizarTabla();
        }
    }

    reiniciarMes() {
        this.transacciones.forEach(t => t.pagado = false);
        this.guardarDatos();
        this.renderizarTabla();
        this.mostrarToast('Mes reiniciado', 'success');
    }

    editarTransaccion(id) {
        const transaccion = this.transacciones.find(t => t.id === id);
        if (!transaccion) return;

        this.focoPrevioEdicion = document.activeElement;
        const editMontoInput = document.getElementById('edit-monto');
        document.getElementById('edit-id').value = transaccion.id;
        document.getElementById('edit-descripcion').value = transaccion.descripcion;
        editMontoInput.value = transaccion.monto.toLocaleString('es-CO');
        editMontoInput.setAttribute('data-raw', String(transaccion.monto));
        document.getElementById('edit-categoria').value = transaccion.categoria;
        document.querySelector(`input[name="edit-tipo"][value="${transaccion.tipo}"]`).checked = true;

        document.getElementById('edit-modal').classList.remove('hidden');
        document.getElementById('edit-modal').classList.add('flex');
        document.getElementById('edit-modal').querySelector('.bg-surface').classList.add('animate-scale-in');
        setTimeout(() => document.getElementById('edit-descripcion').focus(), 50);
    }

    cerrarModalEdicion() {
        const modalContent = document.getElementById('edit-modal').querySelector('.bg-surface');
        modalContent.classList.remove('animate-scale-in');
        modalContent.classList.add('animate-scale-out');
        setTimeout(() => {
            document.getElementById('edit-modal').classList.add('hidden');
            document.getElementById('edit-modal').classList.remove('flex');
            modalContent.classList.remove('animate-scale-out');
            if (this.focoPrevioEdicion) {
                this.focoPrevioEdicion.focus();
                this.focoPrevioEdicion = null;
            }
        }, 200);
    }

    guardarEdicion(e) {
        e.preventDefault();

        const id = parseInt(document.getElementById('edit-id').value);
        const descripcion = document.getElementById('edit-descripcion').value.trim();
        const montoRaw = document.getElementById('edit-monto').value.replace(/\./g, '');
        const monto = parseFloat(montoRaw);
        const categoria = document.getElementById('edit-categoria').value;
        const tipo = document.querySelector('input[name="edit-tipo"]:checked').value;

        if (!descripcion || isNaN(monto) || monto <= 0 || !categoria) {
            this.mostrarToast('Por favor completa todos los campos', 'error');
            return;
        }

        const transaccion = this.transacciones.find(t => t.id === id);
        if (transaccion) {
            transaccion.descripcion = descripcion;
            transaccion.monto = monto;
            transaccion.categoria = categoria;
            transaccion.tipo = tipo;
            this.guardarDatos();
            this.renderizar();
            this.cerrarModalEdicion();
            this.mostrarToast('Transacción actualizada', 'success');
        }
    }

    mostrarToast(mensaje, tipo = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');

        const tipos = {
            success: {
                bg: 'bg-income',
                texto: 'text-zinc-950',
                border: 'border-l-4 border-green-700',
                icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>'
            },
            error: {
                bg: 'bg-red-700',
                texto: 'text-white',
                border: 'border-l-4 border-red-400',
                icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>'
            },
            warning: {
                bg: 'bg-yellow-400',
                texto: 'text-zinc-950',
                border: 'border-l-4 border-yellow-600',
                icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>'
            },
            info: {
                bg: 'bg-blue-600',
                texto: 'text-white',
                border: 'border-l-4 border-blue-400',
                icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'
            }
        };

        const config = tipos[tipo] || tipos.success;

        toast.className = `${config.bg} ${config.texto} ${config.border} px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 min-w-72 max-w-md toast`;
        toast.innerHTML = `
            <div class="flex-shrink-0">${config.icon}</div>
            <div class="flex-1">
                <p class="font-medium text-sm">${this.escaparHtml(mensaje)}</p>
            </div>
            <button type="button" class="toast-close flex-shrink-0 hover:opacity-80 transition-opacity" aria-label="Cerrar notificación">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
        `;

        toast.querySelector('.toast-close').addEventListener('click', () => toast.remove());
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    calcularTotales() {
        const ingresos = this.transacciones
            .filter(t => t.tipo === 'ingreso')
            .reduce((sum, t) => sum + t.monto, 0);

        const gastos = this.transacciones
            .filter(t => t.tipo === 'gasto')
            .reduce((sum, t) => sum + t.monto, 0);

        const balance = ingresos - gastos;

        return { ingresos, gastos, balance };
    }

    formatearMonto(monto) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(monto);
    }

    formatearFecha(fechaISO) {
        const fecha = new Date(fechaISO);
        return fecha.toLocaleDateString('es-CO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    truncarTexto(texto, maxLength = 30) {
        const valor = String(texto ?? '');
        if (valor.length <= maxLength) return valor;
        return valor.substring(0, maxLength) + '...';
    }

    renderizar() {
        this.renderizarTotales();
        this.renderizarTabla();
        this.actualizarGrafico();
    }

    renderizarTotales() {
        const { ingresos, gastos, balance } = this.calcularTotales();

        const animateValue = (element, newValue) => {
            element.classList.add('animate-fade-in');
            setTimeout(() => element.classList.remove('animate-fade-in'), 300);
        };

        const balanceEl = document.getElementById('balance-total');
        const ingresosEl = document.getElementById('total-ingresos');
        const gastosEl = document.getElementById('total-gastos');

        balanceEl.textContent = this.formatearMonto(balance);
        ingresosEl.textContent = this.formatearMonto(ingresos);
        gastosEl.textContent = this.formatearMonto(gastos);

        animateValue(balanceEl);
        animateValue(ingresosEl);
        animateValue(gastosEl);

        const clasesGradiente = ['bg-gradient-to-r', 'from-text-primary', 'to-accent', 'bg-clip-text', 'text-transparent'];
        if (balance >= 0) {
            balanceEl.classList.remove('text-expense');
            balanceEl.classList.add(...clasesGradiente);
        } else {
            balanceEl.classList.remove(...clasesGradiente);
            balanceEl.classList.add('text-expense');
        }
    }

    renderizarTabla() {
        const tbody = document.getElementById('transactions-table');
        const emptyMessage = document.getElementById('table-empty');
        const pagination = document.getElementById('pagination');

        if (this.transacciones.length === 0) {
            tbody.innerHTML = '';
            emptyMessage.classList.remove('hidden');
            pagination.classList.add('hidden');
            return;
        }

        emptyMessage.classList.add('hidden');

        let transaccionesOrdenadas = [...this.transacciones];

        switch (this.ordenActual) {
            case 'date-desc':
                transaccionesOrdenadas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
                break;
            case 'date-asc':
                transaccionesOrdenadas.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
                break;
            case 'amount-desc':
                transaccionesOrdenadas.sort((a, b) => b.monto - a.monto);
                break;
            case 'amount-asc':
                transaccionesOrdenadas.sort((a, b) => a.monto - b.monto);
                break;
        }

        const totalPaginas = Math.ceil(transaccionesOrdenadas.length / this.itemsPorPagina);

        if (this.paginaActual < 1 || this.paginaActual > totalPaginas) {
            this.paginaActual = 1;
        }

        if (transaccionesOrdenadas.length <= this.itemsPorPagina) {
            pagination.classList.add('hidden');
        } else {
            pagination.classList.remove('hidden');
        }

        const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
        const fin = inicio + this.itemsPorPagina;
        const transaccionesPagina = transaccionesOrdenadas.slice(inicio, fin);

        tbody.innerHTML = transaccionesPagina.map((t, index) => {
            const descripcion = this.escaparHtml(this.truncarTexto(t.descripcion, 20));
            const descripcionLarga = this.escaparHtml(this.truncarTexto(t.descripcion, 40));
            const categoria = this.escaparHtml(t.categoria);

            return `
            <tr class="border-b border-border/50 hover:bg-surface-elevated transition-all duration-300 row-animate" style="animation-delay: ${index * 30}ms" data-id="${this.escaparHtml(t.id)}">
                <td class="py-3 px-1 md:px-4 text-center">
                    <input
                        type="checkbox"
                        ${t.pagado ? 'checked' : ''}
                        data-action="toggle-paid"
                        data-id="${this.escaparHtml(t.id)}"
                        aria-label="Marcar como pagado: ${descripcionLarga}"
                        class="custom-checkbox w-5 h-5"
                    >
                </td>
                <td class="py-3 px-1 md:px-4 text-text-secondary text-xs md:text-sm whitespace-nowrap">${this.formatearFecha(t.fecha)}</td>
                <td class="py-3 px-1 md:px-4">
                    <div class="flex items-center gap-1 md:gap-2">
                        <span class="font-medium text-sm md:text-base ${t.pagado ? 'line-through opacity-60' : ''}">${descripcion}</span>
                        ${t.pagado ? '<span class="text-xs text-income" aria-hidden="true">✓</span>' : ''}
                    </div>
                    <div class="md:hidden flex items-center gap-2 mt-1">
                        <span class="px-2 py-0.5 rounded text-xs ${t.tipo === 'ingreso' ? 'bg-income/20 text-income' : 'bg-expense/20 text-expense'}">
                            ${t.tipo === 'ingreso' ? 'Ingreso' : 'Gasto'}
                        </span>
                        <span class="px-1.5 py-0.5 rounded text-xs bg-surface-elevated text-text-secondary">
                            ${categoria}
                        </span>
                    </div>
                </td>
                <td class="py-3 px-1 md:px-4 hidden md:table-cell">
                    <span class="px-2 py-1 rounded-md text-xs bg-surface-elevated text-text-secondary font-medium">
                        ${categoria}
                    </span>
                </td>
                <td class="py-3 px-1 md:px-4 text-right font-bold text-sm md:text-base ${t.tipo === 'ingreso' ? 'text-income' : 'text-expense'}">
                    ${this.formatearMonto(t.monto)}
                </td>
                <td class="py-3 px-1 md:px-4 text-center hidden md:table-cell">
                    <span class="px-3 py-1 rounded-full text-xs font-semibold ${t.tipo === 'ingreso' ? 'bg-income/20 text-income' : 'bg-expense/20 text-expense'}">
                        ${t.tipo === 'ingreso' ? 'Ingreso' : 'Gasto'}
                    </span>
                </td>
                <td class="py-3 px-1 md:px-4 text-center">
                    <div class="flex items-center justify-center gap-1">
                        <button
                            type="button"
                            data-action="editar"
                            data-id="${this.escaparHtml(t.id)}"
                            aria-label="Editar transacción: ${descripcionLarga}"
                            class="tooltip text-info hover:bg-surface-elevated p-2 md:p-2 rounded-lg transition-all duration-200 min-w-[36px] min-h-[36px] md:min-w-[32px] md:min-h-[32px] flex items-center justify-center"
                            data-tooltip="Editar"
                        >
                            <svg class="w-5 h-5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                        </button>
                        <button
                            type="button"
                            data-action="eliminar"
                            data-id="${this.escaparHtml(t.id)}"
                            aria-label="Eliminar transacción: ${descripcionLarga}"
                            class="tooltip text-text-secondary hover:text-expense hover:bg-expense/10 p-2 md:p-2 rounded-lg transition-all duration-200 min-w-[36px] min-h-[36px] md:min-w-[32px] md:min-h-[32px] flex items-center justify-center"
                            data-tooltip="Eliminar"
                        >
                            <svg class="w-5 h-5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `}).join('');

        this.actualizarPaginacion(totalPaginas, inicio, fin);
    }

    actualizarPaginacion(totalPaginas, inicio, fin) {
        document.getElementById('pagination-start').textContent = inicio + 1;
        document.getElementById('pagination-end').textContent = Math.min(fin, this.transacciones.length);
        document.getElementById('pagination-total').textContent = this.transacciones.length;

        const prevBtn = document.getElementById('prev-page');
        const nextBtn = document.getElementById('next-page');
        const pagesContainer = document.getElementById('pagination-pages');

        prevBtn.disabled = this.paginaActual === 1;
        nextBtn.disabled = this.paginaActual === totalPaginas;

        let pagesHtml = '';
        for (let i = 1; i <= totalPaginas; i++) {
            if (
                i === 1 ||
                i === totalPaginas ||
                (i >= this.paginaActual - 1 && i <= this.paginaActual + 1)
            ) {
                pagesHtml += `
                    <button
                        type="button"
                        data-page="${i}"
                        ${i === this.paginaActual ? 'aria-current="page"' : ''}
                        class="w-8 h-8 rounded-lg text-sm font-medium transition-all ${i === this.paginaActual ? 'bg-blue-600 text-white' : 'hover:bg-surface-elevated text-text-secondary'}"
                    >
                        ${i}
                    </button>
                `;
            } else if (
                i === this.paginaActual - 2 ||
                i === this.paginaActual + 2
            ) {
                pagesHtml += '<span class="text-text-secondary">...</span>';
            }
        }
        pagesContainer.innerHTML = pagesHtml;
        pagesContainer.querySelectorAll('button[data-page]').forEach((boton) => {
            boton.addEventListener('click', () => this.irPagina(Number(boton.dataset.page)));
        });

        prevBtn.onclick = () => {
            if (this.paginaActual > 1) {
                this.paginaActual--;
                this.renderizarTabla();
            }
        };

        nextBtn.onclick = () => {
            if (this.paginaActual < totalPaginas) {
                this.paginaActual++;
                this.renderizarTabla();
            }
        };
    }

    irPagina(pagina) {
        this.paginaActual = pagina;
        this.renderizarTabla();
    }

    obtenerGastosPorCategoria() {
        const gastos = this.transacciones.filter(t => t.tipo === 'gasto');

        const categorias = {};
        gastos.forEach(t => {
            if (!categorias[t.categoria]) {
                categorias[t.categoria] = 0;
            }
            categorias[t.categoria] += t.monto;
        });

        return categorias;
    }

    inicializarChart() {
        const ctx = document.getElementById('expense-chart').getContext('2d');

        this.chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        '#8b5cf6',
                        '#3b82f6',
                        '#06b6d4',
                        '#22c55e',
                        '#eab308',
                        '#f97316',
                        '#ec4899',
                        '#6b7280'
                    ],
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%',
                animation: {
                    animateRotate: true,
                    animateScale: true,
                    duration: 800,
                    easing: 'easeOutQuart'
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: document.body.classList.contains('light') ? '#52525b' : '#a1a1aa',
                            padding: 16,
                            font: {
                                family: 'Sora',
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: '#1a1a1a',
                        titleColor: '#f5f5f5',
                        bodyColor: '#a0a0a0',
                        borderColor: '#333333',
                        borderWidth: 1,
                        callbacks: {
                            label: (context) => {
                                const value = context.parsed;
                                return ` ${this.formatearMonto(value)}`;
                            }
                        }
                    }
                }
            }
        });
    }

    actualizarGrafico() {
        const gastosPorCategoria = this.obtenerGastosPorCategoria();
        const chartEmpty = document.getElementById('chart-empty');
        const chartCanvas = document.getElementById('expense-chart');

        const labels = Object.keys(gastosPorCategoria);
        const data = Object.values(gastosPorCategoria);

        if (labels.length === 0) {
            chartEmpty.classList.remove('hidden');
            chartCanvas.style.display = 'none';
            return;
        }

        chartEmpty.classList.add('hidden');
        chartCanvas.style.display = 'block';

        this.chart.data.labels = labels;
        this.chart.data.datasets[0].data = data;
        this.chart.update('active');
    }
}

const app = new PresupuestoApp();