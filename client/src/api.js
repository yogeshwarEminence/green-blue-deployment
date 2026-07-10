// VITE_API_URL is baked into the built JavaScript at BUILD TIME
// (that's how Vite/browser apps work - there is no server-side "process.env"
// available once the code is running in the user's browser).
//
// Because this code runs in the browser (not inside the Docker network),
// it must use an address the browser's machine can actually reach, i.e.
// http://localhost:4000 (the backend port published on the host).
// A Docker service name like "http://backend:4000" would NOT resolve
// from the browser - Docker's internal DNS only works between containers.
const API_URL = '';

async function handleResponse(res) {
  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const body = await res.json();
      if (body.error) message = body.error;
    } catch {
      // response had no JSON body - ignore
    }
    throw new Error(message);
  }
  return res.json();
}

export async function getEmployees() {
  const res = await fetch(`${API_URL}/api/employees`);
  return handleResponse(res);
}

export async function createEmployee(employee) {
  const res = await fetch(`${API_URL}/api/employees`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(employee),
  });
  return handleResponse(res);
}

export async function updateEmployee(id, employee) {
  const res = await fetch(`${API_URL}/api/employees/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(employee),
  });
  return handleResponse(res);
}

export async function deleteEmployee(id) {
  const res = await fetch(`${API_URL}/api/employees/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(res);
}
