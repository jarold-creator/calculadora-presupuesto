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

    obtenerPerfiles() {
        const datos = localStorage.getItem(this.perfilesKey);
        return datos ? JSON.parse(datos) : [];
    }

    obtenerPerfilActivo() {
        return localStorage.getItem(this.perfilActivoKey) || 'Mi Perfil';
    }

    getStorageKeyPerfil() {
        return `presupuesto_datos_${this.obtenerPerfilActivo()}`;
    }

    cargarDatos() {
        const datos = localStorage.getItem(this.getStorageKeyPerfil());
        if (datos) {
            this.transacciones = JSON.parse(datos);
        } else {
            this.transacciones = [];
        }
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

        const themeToggle = document.getElementById('theme-toggle');
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('light');
            const isLight = document.body.classList.contains('light');
            localStorage.setItem(this.themeKey, isLight ? 'light' : 'dark');
            this.actualizarIconoTema();
        });
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

        let html = `
            <div class="relative inline-block">
                <button id="profile-btn" class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-elevated transition-all border border-transparent hover:border-border">
                    <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                    <span class="font-medium text-sm">${activo}</span>
                    <svg class="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                </button>
                <div id="profile-dropdown" class="hidden absolute right-0 mt-2 w-64 bg-surface border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
                    <div class="p-3 border-b border-border">
                        <p class="text-xs font-medium text-text-secondary uppercase tracking-wider">Mis Perfiles</p>
                    </div>
                    <div class="p-2 max-h-64 overflow-y-auto">
                        ${perfiles.map(p => `
                            <div class="flex items-center justify-between group rounded-lg hover:bg-surface-elevated transition-all ${p === activo ? 'bg-blue-500/10' : ''}">
                                <button onclick="app.cambiarPerfil('${p}')" class="flex-1 text-left px-3 py-2.5 ${p === activo ? 'text-blue-400 font-medium' : ''}">
                                    ${p}
                                    ${p === activo ? '<span class="text-xs text-blue-500 ml-2">● Activo</span>' : ''}
                                </button>
                                ${perfiles.length > 1 ? `
                                    <button onclick="app.confirmarEliminarPerfil('${p}')" class="opacity-0 group-hover:opacity-100 p-2 text-text-secondary hover:text-expense transition-all" title="Eliminar perfil">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                        </svg>
                                    </button>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                    <div class="p-2 border-t border-border">
                        <button onclick="app.mostrarCrearPerfil()" class="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg hover:bg-surface-elevated transition-all text-income font-medium">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                            </svg>
                            Crear nuevo perfil
                        </button>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;

        const btn = document.getElementById('profile-btn');
        const dropdown = document.getElementById('profile-dropdown');
        btn.addEventListener('click', () => {
            dropdown.classList.toggle('hidden');
        });

        document.addEventListener('click', (e) => {
            if (!btn.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.add('hidden');
            }
        });
    }

    confirmarEliminarPerfil(nombre) {
        const perfiles = this.obtenerPerfiles();
        if (perfiles.length <= 1) {
            this.mostrarToast('No puedes eliminar el único perfil', 'warning');
            return;
        }

        document.getElementById('profile-dropdown').classList.add('hidden');
        
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-surface rounded-xl p-6 border border-border shadow-xl w-full max-w-sm">
                <div class="flex items-center gap-4 mb-4">
                    <div class="w-12 h-12 rounded-full bg-expense/20 flex items-center justify-center">
                        <svg class="w-6 h-6 text-expense" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                        </svg>
                    </div>
                    <div>
                        <h3 class="text-lg font-semibold">Eliminar Perfil</h3>
                        <p class="text-sm text-text-secondary">Esta acción no se puede deshacer</p>
                    </div>
                </div>
                <p class="text-text-secondary mb-6">¿Estás seguro de eliminar el perfil "<strong>${nombre}</strong>"? Se perderán todos los datos asociados.</p>
                <div class="flex gap-3">
                    <button onclick="this.closest('.fixed').remove()" class="flex-1 bg-surface-elevated hover:bg-border text-text-primary font-semibold py-3 rounded-lg transition-all">
                        Cancelar
                    </button>
                    <button onclick="app.eliminarPerfil('${nombre}'); this.closest('.fixed').remove()" class="flex-1 bg-expense hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition-all">
                        Eliminar
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    cambiarPerfil(nombre) {
        localStorage.setItem(this.perfilActivoKey, nombre);
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

        if (!confirm(`¿Eliminar el perfil "${nombre}" y todos sus datos?`)) {
            return;
        }

        localStorage.removeItem(`presupuesto_datos_${nombre}`);
        const nuevosPerfiles = perfiles.filter(p => p !== nombre);
        localStorage.setItem(this.perfilesKey, JSON.stringify(nuevosPerfiles));

        const activo = this.obtenerPerfilActivo();
        if (nombre === activo) {
            localStorage.setItem(this.perfilActivoKey, nuevosPerfiles[0]);
        }

        this.cargarDatos();
        this.renderizar();
        this.renderizarSelectorPerfil();
        this.mostrarToast('Perfil eliminado', 'success');
    }

    mostrarCrearPerfil() {
        document.getElementById('new-profile-name').value = '';
        document.getElementById('create-profile-modal').classList.remove('hidden');
        document.getElementById('create-profile-modal').classList.add('flex');
        document.getElementById('create-profile-modal').querySelector('.bg-surface').classList.add('animate-scale-in');
        document.getElementById('new-profile-name').focus();
    }

    cerrarModalCrearPerfil() {
        const modalContent = document.getElementById('create-profile-modal').querySelector('.bg-surface');
        modalContent.classList.remove('animate-scale-in');
        modalContent.classList.add('animate-scale-out');
        setTimeout(() => {
            document.getElementById('create-profile-modal').classList.add('hidden');
            document.getElementById('create-profile-modal').classList.remove('flex');
            modalContent.classList.remove('animate-scale-out');
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

        if (!descripcion || isNaN(monto) || monto <= 0 || !categoria) {
            return;
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

        this.mostrarModalConfirmacion(
            'Eliminar Transacción',
            `¿Estás seguro de eliminar "${this.truncarTexto(transaccion.descripcion, 40)}" por ${this.formatearMonto(transaccion.monto)}?`,
            () => {
                this.transacciones = this.transacciones.filter(t => t.id !== id);
                this.guardarDatos();
                this.renderizar();
                this.mostrarToast('Transacción eliminada', 'error');
            }
        );
    }

    mostrarModalConfirmacion(titulo, mensaje, onConfirm) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 modal-backdrop';
        modal.innerHTML = `
            <div class="bg-surface rounded-xl p-6 border border-border shadow-xl w-full max-w-sm animate-scale-in">
                <div class="flex items-center gap-4 mb-4">
                    <div class="w-12 h-12 rounded-full bg-expense/20 flex items-center justify-center flex-shrink-0">
                        <svg class="w-6 h-6 text-expense" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                        </svg>
                    </div>
                    <div>
                        <h3 class="text-lg font-semibold">${titulo}</h3>
                    </div>
                </div>
                <p class="text-text-secondary mb-6">${mensaje}</p>
                <div class="flex gap-3">
                    <button class="cancel-confirm flex-1 bg-surface-elevated hover:bg-border text-text-primary font-semibold py-3 rounded-lg transition-all btn-hover">
                        Cancelar
                    </button>
                    <button class="confirm-delete flex-1 bg-expense hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition-all btn-hover">
                        Eliminar
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('.cancel-confirm').addEventListener('click', () => {
            modal.remove();
        });

        modal.querySelector('.confirm-delete').addEventListener('click', () => {
            modal.remove();
            onConfirm();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
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

        document.getElementById('edit-id').value = transaccion.id;
        document.getElementById('edit-descripcion').value = transaccion.descripcion;
        document.getElementById('edit-monto').value = transaccion.monto.toLocaleString('es-CO');
        document.getElementById('edit-categoria').value = transaccion.categoria;
        document.querySelector(`input[name="edit-tipo"][value="${transaccion.tipo}"]`).checked = true;

        document.getElementById('edit-modal').classList.remove('hidden');
        document.getElementById('edit-modal').classList.add('flex');
        document.getElementById('edit-modal').querySelector('.bg-surface').classList.add('animate-scale-in');
    }

    cerrarModalEdicion() {
        const modalContent = document.getElementById('edit-modal').querySelector('.bg-surface');
        modalContent.classList.remove('animate-scale-in');
        modalContent.classList.add('animate-scale-out');
        setTimeout(() => {
            document.getElementById('edit-modal').classList.add('hidden');
            document.getElementById('edit-modal').classList.remove('flex');
            modalContent.classList.remove('animate-scale-out');
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
                border: 'border-l-4 border-green-400',
                icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>'
            },
            error: {
                bg: 'bg-expense',
                border: 'border-l-4 border-red-400',
                icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>'
            },
            warning: {
                bg: 'bg-yellow-500',
                border: 'border-l-4 border-yellow-400',
                icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>'
            },
            info: {
                bg: 'bg-blue-500',
                border: 'border-l-4 border-blue-400',
                icon: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>'
            }
        };

        const config = tipos[tipo] || tipos.success;

        toast.className = `${config.bg} ${config.border} text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 min-w-72 max-w-md toast`;
        toast.innerHTML = `
            <div class="flex-shrink-0">${config.icon}</div>
            <div class="flex-1">
                <p class="font-medium text-sm">${mensaje}</p>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" class="flex-shrink-0 hover:opacity-80 transition-opacity">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
            </button>
        `;

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
        return fecha.toLocaleDateString('es-MX', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    truncarTexto(texto, maxLength = 30) {
        if (texto.length <= maxLength) return texto;
        return texto.substring(0, maxLength) + '...';
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

        if (balance >= 0) {
            balanceEl.classList.remove('text-expense');
            balanceEl.classList.add('text-text-primary');
        } else {
            balanceEl.classList.remove('text-text-primary');
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
        
        if (transaccionesOrdenadas.length <= this.itemsPorPagina) {
            pagination.classList.add('hidden');
        } else {
            pagination.classList.remove('hidden');
            if (this.paginaActual > totalPaginas) {
                this.paginaActual = 1;
            }
        }

        const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
        const fin = inicio + this.itemsPorPagina;
        const transaccionesPagina = transaccionesOrdenadas.slice(inicio, fin);

        tbody.innerHTML = transaccionesPagina.map((t, index) => `
            <tr class="border-b border-border/50 hover:bg-surface-elevated transition-all duration-300 row-animate" style="animation-delay: ${index * 30}ms" data-id="${t.id}">
                <td class="py-3 px-1 md:px-4 text-center">
                    <input
                        type="checkbox"
                        ${t.pagado ? 'checked' : ''}
                        onchange="app.togglePagado(${t.id})"
                        class="custom-checkbox w-5 h-5"
                    >
                </td>
                <td class="py-3 px-1 md:px-4 text-text-secondary text-xs md:text-sm whitespace-nowrap">${this.formatearFecha(t.fecha)}</td>
                <td class="py-3 px-1 md:px-4">
                    <div class="flex items-center gap-1 md:gap-2">
                        <span class="font-medium text-sm md:text-base ${t.pagado ? 'line-through opacity-60' : ''}">${this.truncarTexto(t.descripcion, 20)}</span>
                        ${t.pagado ? '<span class="text-xs text-income">✓</span>' : ''}
                    </div>
                    <div class="md:hidden flex items-center gap-2 mt-1">
                        <span class="px-2 py-0.5 rounded text-xs ${t.tipo === 'ingreso' ? 'bg-income/20 text-income' : 'bg-expense/20 text-expense'}">
                            ${t.tipo === 'ingreso' ? 'Ingreso' : 'Gasto'}
                        </span>
                        <span class="px-1.5 py-0.5 rounded text-xs bg-surface-elevated text-text-secondary">
                            ${t.categoria}
                        </span>
                    </div>
                </td>
                <td class="py-3 px-1 md:px-4 hidden md:table-cell">
                    <span class="px-2 py-1 rounded-md text-xs bg-surface-elevated text-text-secondary font-medium">
                        ${t.categoria}
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
                            onclick="app.editarTransaccion(${t.id})"
                            class="tooltip text-blue-500 hover:text-blue-400 hover:bg-blue-500/10 p-2 md:p-2 rounded-lg transition-all duration-200 min-w-[36px] min-h-[36px] md:min-w-[32px] md:min-h-[32px] flex items-center justify-center"
                            data-tooltip="Editar"
                        >
                            <svg class="w-5 h-5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                        </button>
                        <button
                            onclick="app.eliminarTransaccion(${t.id})"
                            class="tooltip text-text-secondary hover:text-expense hover:bg-expense/10 p-2 md:p-2 rounded-lg transition-all duration-200 min-w-[36px] min-h-[36px] md:min-w-[32px] md:min-h-[32px] flex items-center justify-center"
                            data-tooltip="Eliminar"
                        >
                            <svg class="w-5 h-5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

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
                        onclick="app.irPagina(${i})"
                        class="w-8 h-8 rounded-lg text-sm font-medium transition-all ${i === this.paginaActual ? 'bg-blue-500 text-white' : 'hover:bg-surface-elevated text-text-secondary'}"
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
                            color: '#a0a0a0',
                            padding: 16,
                            font: {
                                family: 'Inter',
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