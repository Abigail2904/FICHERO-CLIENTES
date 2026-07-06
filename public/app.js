const apiBase = '/api/clients';

const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const clearBtn = document.getElementById('clearBtn');
const listEl = document.getElementById('list');

const firstNameInput = document.getElementById('firstName');
const lastNameInput = document.getElementById('lastName');
const descriptionInput = document.getElementById('description');
const saveBtn = document.getElementById('saveBtn');
const cancelBtn = document.getElementById('cancelBtn');
const formTitle = document.getElementById('formTitle');

let editingId = null;

async function fetchClients(q = ''){
  const url = q ? `${apiBase}?search=${encodeURIComponent(q)}` : apiBase;
  const res = await fetch(url);
  return res.json();
}

function groupByInitial(clients){
  const map = {};
  clients.forEach(c => {
    const initial = (c.firstName && c.firstName[0] ? c.firstName[0] : '?').toUpperCase();
    if (!map[initial]) map[initial] = [];
    map[initial].push(c);
  });
  return Object.keys(map).sort().map(k => ({ letter:k, items: map[k] }));
}

function renderList(clients){
  const groups = groupByInitial(clients);
  listEl.innerHTML = '';
  let counter = 1;
  groups.forEach(g => {
    const section = document.createElement('div');
    section.className = 'group';
    const h = document.createElement('h2');
    h.textContent = g.letter;
    section.appendChild(h);
    g.items.forEach(item => {
      const div = document.createElement('div');
      div.className = 'client';
      div.innerHTML = `
        <div class="client-main">
          <div class="num">${counter++}.</div>
          <div class="name">${item.firstName} ${item.lastName}</div>
          <div class="actions">
            <button data-id="${item._id}" class="edit">Editar</button>
            <button data-id="${item._id}" class="del">Borrar</button>
          </div>
        </div>
        <div class="desc">${item.description || ''}</div>
      `;
      section.appendChild(div);
    });
    listEl.appendChild(section);
  });
  attachListEvents();
}

function attachListEvents(){
  document.querySelectorAll('.edit').forEach(b => {
    b.onclick = async () => {
      const id = b.dataset.id;
      const res = await fetch(`${apiBase}/${id}`);
      const c = await res.json();
      editingId = id;
      formTitle.textContent = 'Editar cliente';
      firstNameInput.value = c.firstName;
      lastNameInput.value = c.lastName;
      descriptionInput.value = c.description || '';
      cancelBtn.style.display = 'inline-block';
    };
  });
  document.querySelectorAll('.del').forEach(b => {
    b.onclick = async () => {
      if (!confirm('Borrar este cliente?')) return;
      const id = b.dataset.id;
      await fetch(`${apiBase}/${id}`, { method: 'DELETE' });
      loadAll();
    };
  });
}

async function loadAll(){
  try {
    const clients = await fetchClients('');
    renderList(clients);
  } catch (err) {
    listEl.innerHTML = '<p>No se pudieron cargar los clientes. Revisa la conexión a MongoDB.</p>';
    console.error(err);
  }
}

searchBtn.onclick = async () => {
  const q = searchInput.value.trim();
  const clients = await fetchClients(q);
  renderList(clients);
};

clearBtn.onclick = async () => {
  searchInput.value = '';
  loadAll();
};

saveBtn.onclick = async () => {
  const data = {
    firstName: firstNameInput.value.trim(),
    lastName: lastNameInput.value.trim(),
    description: descriptionInput.value.trim()
  };
  if (!data.firstName || !data.lastName) {
    alert('Nombre y apellido requeridos');
    return;
  }
  if (editingId) {
    await fetch(`${apiBase}/${editingId}`, { method: 'PUT', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(data) });
    editingId = null;
    formTitle.textContent = 'Nuevo cliente';
    cancelBtn.style.display = 'none';
  } else {
    await fetch(apiBase, { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(data) });
  }
  firstNameInput.value = '';
  lastNameInput.value = '';
  descriptionInput.value = '';
  loadAll();
};

cancelBtn.onclick = () => {
  editingId = null;
  formTitle.textContent = 'Nuevo cliente';
  firstNameInput.value = '';
  lastNameInput.value = '';
  descriptionInput.value = '';
  cancelBtn.style.display = 'none';
};

// inicial
loadAll();
