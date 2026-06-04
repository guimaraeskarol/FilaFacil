// FilaFácil - JavaScript Principal v2.0
// Sistema de Gerenciamento de Filas Digitais

// ============================================
// CONFIGURAÇÃO SOCKET.IO
// ============================================

const socket = io();

socket.on('connect', () => {
  console.log('✓ Conectado ao servidor WebSocket');
  // Tentar inscrever automaticamente na sala da fila caso estejamos numa página de fila
  try {
    const m = window.location.pathname.match(/queues(?:\/view)?\/(\d+)/);
    if (m && m[1]) {
      const queueId = m[1];
      socket.emit('subscribeQueue', { queueId });
      console.log('Inscrito na sala da fila:', queueId);
    }
  } catch (e) {
    console.warn('Erro ao tentar inscrever em sala de fila:', e);
  }
});

socket.on('disconnect', () => {
  console.log('✗ Desconectado do servidor WebSocket');
});

// ============================================
// FUNÇÕES DE NOTIFICAÇÃO DESATIVADAS
// ============================================

function showNotification() {
  // Função mantida como placeholder; notificações visuais foram removidas.
}

/**
 * Mostra um diálogo de confirmação elegante
 * @param {string} message - Mensagem de confirmação
 * @returns {Promise<boolean>} - Retorna true se confirmado
 */
function showConfirmDialog(message) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      animation: fadeIn 0.2s ease;
    `;

    const dialog = document.createElement('div');
    dialog.style.cssText = `
      background: white;
      padding: 32px;
      border-radius: 16px;
      max-width: 400px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    `;

    dialog.innerHTML = `
      <p style="margin: 0 0 24px 0; font-size: 16px; color: #1a1a1a; font-weight: 500;">
        ${message}
      </p>
      <div style="display: flex; gap: 12px; justify-content: flex-end;">
        <button id="cancel-btn" style="
          padding: 8px 16px;
          border-radius: 8px;
          border: 2px solid #e0e0e0;
          background: white;
          color: #666;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        ">Cancelar</button>
        <button id="confirm-btn" style="
          padding: 8px 16px;
          border-radius: 8px;
          border: none;
          background: linear-gradient(135deg, #0066cc 0%, #7c3aed 100%);
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        ">Confirmar</button>
      </div>
    `;

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    const confirmBtn = dialog.querySelector('#confirm-btn');
    const cancelBtn = dialog.querySelector('#cancel-btn');

    confirmBtn.addEventListener('click', () => {
      overlay.style.animation = 'fadeOut 0.2s ease';
      setTimeout(() => overlay.remove(), 200);
      resolve(true);
    });

    cancelBtn.addEventListener('click', () => {
      overlay.style.animation = 'fadeOut 0.2s ease';
      setTimeout(() => overlay.remove(), 200);
      resolve(false);
    });

    // Fechar ao clicar fora
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.style.animation = 'fadeOut 0.2s ease';
        setTimeout(() => overlay.remove(), 200);
        resolve(false);
      }
    });
  });
}

/**
 * Mostra um carregamento elegante
 * @returns {Function} - Função para remover o carregamento
 */
function showLoading() {
  const overlay = document.createElement('div');
  overlay.id = 'loading-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9998;
    animation: fadeIn 0.2s ease;
  `;

  const spinner = document.createElement('div');
  spinner.style.cssText = `
    width: 50px;
    height: 50px;
    border: 4px solid rgba(0, 102, 204, 0.2);
    border-top-color: #0066cc;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  `;

  overlay.appendChild(spinner);
  document.body.appendChild(overlay);

  return () => {
    overlay.style.animation = 'fadeOut 0.2s ease';
    setTimeout(() => overlay.remove(), 200);
  };
}

// ============================================
// FUNÇÕES DE GERENCIAMENTO DE FILAS
// ============================================

/**
 * Usuário entra na fila
 */
async function joinQueue(queueId) {
  const removeLoading = showLoading();

  try {
    const response = await fetch(`/queues/${queueId}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    removeLoading();

    if (data.success) {
      showNotification(
        `✓ Você entrou na fila! Posição: ${data.position}º`,
        'success',
        3000
      );
      
      // Recarregar após 1 segundo para melhor UX
      setTimeout(() => location.reload(), 1000);
    } else {
      showNotification(
        `Erro: ${data.error}`,
        'error',
        5000
      );
    }
  } catch (error) {
    removeLoading();
    console.error('Erro ao entrar na fila:', error);
    showNotification(
      'Erro ao conectar com o servidor',
      'error',
      5000
    );
  }
}

/**
 * Usuário sai da fila
 */
async function leaveQueue(queueId) {
  const confirmed = await showConfirmDialog(
    'Tem certeza que deseja sair da fila?'
  );

  if (!confirmed) return;

  const removeLoading = showLoading();

  try {
    const response = await fetch(`/queues/${queueId}/leave`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    removeLoading();

    if (data.success) {
      showNotification(
        'Você saiu da fila',
        'success',
        3000
      );
      
      setTimeout(() => location.reload(), 1000);
    } else {
      showNotification(
        `Erro: ${data.error}`,
        'error',
        5000
      );
    }
  } catch (error) {
    removeLoading();
    console.error('Erro ao sair da fila:', error);
    showNotification(
      'Erro ao conectar com o servidor',
      'error',
      5000
    );
  }
}

/**
 * Chamar próximo usuário (Admin)
 */
async function callNextUser(queueId) {
  const removeLoading = showLoading();

  try {
    const response = await fetch(`/queues/${queueId}/call-next`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    removeLoading();

    if (data.success) {
      const userName = data.user.name || `Usuário #${data.user.userId}`;
      
      showNotification(
        `Próximo usuário chamado: ${userName}`,
        'info',
        3000
      );

      socket.emit('user-called', { queueId, user: data.user });

      // Atualizar UI do painel admin
      const currentAttendance = document.getElementById('current-attendance');
      if (currentAttendance) {
        currentAttendance.classList.remove('d-none');
        const userNameEl = document.getElementById('current-user-name');
        if (userNameEl) {
          userNameEl.innerText = userName;
          userNameEl.style.animation = 'slideUp 0.3s ease';
        }
        window.currentQueueUserId = data.user.id;
      } else {
        location.reload();
      }
    } else {
      showNotification(
        `Erro: ${data.error}`,
        'error',
        5000
      );
    }
  } catch (error) {
    removeLoading();
    console.error('Erro ao chamar próximo usuário:', error);
    showNotification(
      'Erro ao conectar com o servidor',
      'error',
      5000
    );
  }
}

/**
 * Atender próximo para um estabelecimento: busca a primeira fila e chama callNextUser
 */
async function attendNextForEstablishment(establishmentId) {
  try {
    const resp = await fetch(`/api/queues/establishment/${establishmentId}`);
    const json = await resp.json();
    if (!json.success || !json.queues || json.queues.length === 0) {
      showNotification('Nenhuma fila disponível para atendimento neste estabelecimento', 'warning', 4000);
      return;
    }
    const queueId = json.queues[0].id;
    // Confirmar ação
    const confirmed = await showConfirmDialog('Chamar o próximo cliente na fila agora?');
    if (!confirmed) return;
    // Chamar próximo usando função existente
    callNextUser(queueId);
  } catch (e) {
    console.error('Erro ao buscar filas do estabelecimento:', e);
    showNotification('Erro ao conectar com o servidor', 'error', 4000);
  }
}

// Delegar clicks no botão de atender próximo nos cards de estabelecimento (admin)
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.attend-next-establishment');
  if (!btn) return;
  const establishmentId = btn.getAttribute('data-establishment-id');
  if (!establishmentId) return;
  attendNextForEstablishment(establishmentId);
});

/**
 * Finalizar atendimento (Admin)
 */
async function finishAttendance(queueId, queueUserId) {
  const id = queueUserId || window.currentQueueUserId;

  if (!id) {
    showNotification(
      'Nenhum atendimento em curso para finalizar',
      'warning',
      3000
    );
    return;
  }

  const confirmed = await showConfirmDialog(
    'Finalizar atendimento deste usuário?'
  );

  if (!confirmed) return;

  const removeLoading = showLoading();

  try {
    const response = await fetch(`/queues/${queueId}/finish-attendance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ queueUserId: id })
    });

    const data = await response.json();
    removeLoading();

    if (data.success) {
      showNotification(
        'Atendimento finalizado com sucesso',
        'success',
        3000
      );
      
      setTimeout(() => location.reload(), 1000);
    } else {
      showNotification(
        `Erro: ${data.error}`,
        'error',
        5000
      );
    }
  } catch (error) {
    removeLoading();
    console.error('Erro ao finalizar atendimento:', error);
    showNotification(
      'Erro ao conectar com o servidor',
      'error',
      5000
    );
  }
}

// ============================================
// ATUALIZAÇÕES EM TEMPO REAL
// ============================================

/**
 * Atualizar posição na fila em tempo real
 */
socket.on('queue-update', (data) => {
  console.log('Atualização de fila recebida:', data);
  
  // Atualizar elementos da UI se existirem
  if (data.queueCount !== undefined) {
    const queueCountEl = document.getElementById('queue-count');
    if (queueCountEl) {
      queueCountEl.innerText = data.queueCount;
      queueCountEl.style.animation = 'bounce 0.6s ease';
    }
  }

  if (data.waitTime !== undefined) {
    const waitTimeEl = document.getElementById('wait-time');
    if (waitTimeEl) {
      waitTimeEl.innerText = `${data.waitTime} min`;
      waitTimeEl.style.animation = 'bounce 0.6s ease';
    }
  }

  if (data.userPosition !== undefined) {
    const userPosEl = document.getElementById('user-pos');
    if (userPosEl) {
      userPosEl.innerText = data.userPosition > 0 ? `${data.userPosition}º` : '-';
      userPosEl.style.animation = 'bounce 0.6s ease';
    }
  }
});

// ============================================
// INICIALIZAÇÃO
// ============================================

// Smooth scroll para links internos
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Adicionar estilos de animação ao documento
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(100px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideOutRight {
    from {
      opacity: 1;
      transform: translateX(0);
    }
    to {
      opacity: 0;
      transform: translateX(100px);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes bounce {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
  }
`;
document.head.appendChild(style);

console.log('✓ FilaFácil v2.0 - Sistema de Gerenciamento de Filas Digitais');
console.log('✓ Modernização visual e UX aplicada com sucesso');

// ============================================
// Clique direto: Entrar na fila sem formulário
// - busca a primeira fila do estabelecimento e tenta entrar automaticamente
// - tenta entrar como usuário autenticado; se falhar, faz join como guest automático
// ============================================
document.addEventListener('click', async (e) => {
  const btn = e.target.closest('.enter-queue-btn');
  if (!btn) return;

  const establishmentId = btn.getAttribute('data-establishment-id');
  if (!establishmentId) return;

  btn.disabled = true;
  showNotification('Entrando na fila...', 'info', 2000);

  try {
    const resp = await fetch(`/api/queues/establishment/${establishmentId}`);
    const json = await resp.json();
    if (!json.success || !json.queues || json.queues.length === 0) {
      showNotification('Nenhuma fila disponível neste estabelecimento', 'warning', 4000);
      btn.disabled = false;
      return;
    }

    const queueId = json.queues[0].id;

    // Primeiro, tentar entrar como usuário autenticado (rota /queues/:id/join)
    let joined = false;
    try {
      const joinResp = await fetch(`/queues/${queueId}/join`, { method: 'POST', headers: { 'Accept': 'application/json' } });
      const ct = joinResp.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        const joinData = await joinResp.json();
        if (joinData && joinData.success) {
          showNotification(`Você entrou na fila! Posição: ${joinData.position}º`, 'success', 3000);
          socket.emit('user-joined', { queueId, user: joinData.user || { id: null }, position: joinData.position });
          window.location.href = '/dashboard';
          joined = true;
          return;
        }
      }
    } catch (err) {
      console.warn('Tentativa de join autenticado falhou, tentando como guest...', err);
    }

    if (!joined) {
      // Entrar como guest automaticamente (nome gerado)
      const guestName = `Convidado ${Date.now()}`;
      const guestResp = await fetch(`/guest/queues/${queueId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: guestName, phone: '' })
      });
      const guestData = await guestResp.json();
      if (guestData && guestData.success) {
        showNotification(`Você entrou na fila! Posição: ${guestData.position}º`, 'success', 3000);
        socket.emit('user-joined', { queueId, user: guestData.user, position: guestData.position });
        window.location.href = '/dashboard';
        return;
      } else {
        showNotification(`Erro: ${guestData.error || 'Não foi possível entrar na fila'}`, 'error', 5000);
        btn.disabled = false;
        return;
      }
    }
  } catch (err) {
    console.error('Erro ao processar entrada na fila:', err);
    showNotification('Erro ao conectar com o servidor', 'error', 5000);
    btn.disabled = false;
  }
});
