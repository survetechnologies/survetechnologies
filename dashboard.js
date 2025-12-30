// Dashboard JavaScript

document.addEventListener('DOMContentLoaded', () => {
  // Check authentication
  const authToken = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
  const userEmail = sessionStorage.getItem('userEmail') || localStorage.getItem('userEmail');
  
  if (!authToken) {
    // Redirect to login if not authenticated
    window.location.href = 'login.html';
    return;
  }

  // Display user email
  const userEmailElement = document.getElementById('userEmail');
  if (userEmailElement && userEmail) {
    userEmailElement.textContent = userEmail;
  }

  // Tab switching
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTab = button.getAttribute('data-tab');

      // Update active tab button
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      // Update active tab content
      tabContents.forEach(content => content.classList.remove('active'));
      document.getElementById(`${targetTab}Tab`).classList.add('active');

      // Load data for the active tab
      if (targetTab === 'products') {
        loadProducts();
      } else if (targetTab === 'tasks') {
        loadTasks();
      } else if (targetTab === 'billing') {
        loadBilling();
      }
    });
  });

  // Logout functionality
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      // Clear all stored data
      sessionStorage.clear();
      localStorage.clear();
      // Redirect to login
      window.location.href = 'login.html';
    });
  }

  // Load initial data
  loadProducts();

  // Task Creation Modal
  const createTaskBtn = document.getElementById('createTaskBtn');
  const createTaskModal = document.getElementById('createTaskModal');
  const closeTaskModal = document.getElementById('closeTaskModal');
  const cancelTaskBtn = document.getElementById('cancelTaskBtn');
  const createTaskForm = document.getElementById('createTaskForm');
  const addNewProductLink = document.getElementById('addNewProductLink');
  const newProductGroup = document.getElementById('newProductGroup');
  const taskProductSelect = document.getElementById('taskProduct');
  const newProductNameInput = document.getElementById('newProductName');

  // Open modal
  if (createTaskBtn) {
    createTaskBtn.addEventListener('click', () => {
      openTaskModal();
    });
  }

  // Close modal
  if (closeTaskModal) {
    closeTaskModal.addEventListener('click', closeTaskModalHandler);
  }

  if (cancelTaskBtn) {
    cancelTaskBtn.addEventListener('click', closeTaskModalHandler);
  }

  // Close modal when clicking outside
  if (createTaskModal) {
    createTaskModal.addEventListener('click', (e) => {
      if (e.target === createTaskModal) {
        closeTaskModalHandler();
      }
    });
  }

  // Toggle new product input
  if (addNewProductLink) {
    addNewProductLink.addEventListener('click', (e) => {
      e.preventDefault();
      newProductGroup.style.display = newProductGroup.style.display === 'none' ? 'block' : 'none';
      if (newProductGroup.style.display === 'block') {
        taskProductSelect.value = '';
        taskProductSelect.required = false;
        newProductNameInput.required = true;
      } else {
        taskProductSelect.required = true;
        newProductNameInput.required = false;
        newProductNameInput.value = '';
      }
    });
  }

  // Handle form submission
  if (createTaskForm) {
    createTaskForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await submitTask();
    });
  }

  function openTaskModal() {
    if (createTaskModal) {
      createTaskModal.classList.add('show');
      populateProductDropdown();
      createTaskForm.reset();
      newProductGroup.style.display = 'none';
      taskProductSelect.required = true;
      newProductNameInput.required = false;
      document.getElementById('taskErrorMessage').classList.remove('show');
    }
  }

  function closeTaskModalHandler() {
    if (createTaskModal) {
      createTaskModal.classList.remove('show');
      createTaskForm.reset();
      newProductGroup.style.display = 'none';
    }
  }

  async function populateProductDropdown() {
    if (!taskProductSelect) return;

    // Get products from storage or API
    const storedProducts = sessionStorage.getItem('userProducts') || localStorage.getItem('userProducts');
    let products = [];

    if (storedProducts) {
      try {
        const parsed = JSON.parse(storedProducts);
        if (Array.isArray(parsed)) {
          products = parsed;
        } else if (parsed && Array.isArray(parsed.data)) {
          products = parsed.data;
        }
      } catch (e) {
        console.error('Error parsing stored products:', e);
      }
    }

    // Clear existing options (except the first one)
    taskProductSelect.innerHTML = '<option value="">Choose a product...</option>';

    // Add products to dropdown
    products.forEach(product => {
      const option = document.createElement('option');
      option.value = product.productId || product.id || '';
      option.textContent = product.productName || product.name || 'Unknown Product';
      taskProductSelect.appendChild(option);
    });
  }

  async function submitTask() {
    const errorMessage = document.getElementById('taskErrorMessage');
    const submitButton = createTaskForm.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    
    // Clear previous errors
    errorMessage.classList.remove('show');
    errorMessage.textContent = '';
    submitButton.disabled = true;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

    try {
      // Get form data
      const formData = new FormData(createTaskForm);
      const productId = formData.get('productId');
      const newProductName = formData.get('newProductName');
      const taskType = formData.get('taskType');
      const description = formData.get('description');
      const priority = formData.get('priority');
      const dueDate = formData.get('dueDate');
      const attachments = formData.getAll('attachments');

      // Validate
      if (!productId && !newProductName) {
        throw new Error('Please select a product or enter a new product name');
      }

      if (!taskType || !description) {
        throw new Error('Please fill in all required fields');
      }

      // Prepare task data
      const taskData = {
        productId: productId || null,
        newProductName: newProductName || null,
        taskType: taskType,
        description: description,
        priority: priority || 'normal',
        dueDate: dueDate || null
      };

      // Get auth token
      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication required. Please login again.');
      }

      // Prepare request
      const createTaskUrl = window.AppConfig ? window.AppConfig.getCreateTaskUrl() : '/api/v1/tasks';
      
      // Create FormData for file uploads
      const requestData = new FormData();
      requestData.append('productId', taskData.productId || '');
      if (taskData.newProductName) {
        requestData.append('newProductName', taskData.newProductName);
      }
      requestData.append('taskType', taskData.taskType);
      requestData.append('description', taskData.description);
      requestData.append('priority', taskData.priority);
      if (taskData.dueDate) {
        requestData.append('dueDate', taskData.dueDate);
      }

      // Add attachments if any
      attachments.forEach((file, index) => {
        if (file && file.size > 0) {
          requestData.append(`attachments[${index}]`, file);
        }
      });

      // Submit task
      const response = await fetch(createTaskUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type for FormData - browser will set it with boundary
        },
        body: requestData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to create task' }));
        throw new Error(errorData.message || errorData.error || `Failed to create task: ${response.status}`);
      }

      const result = await response.json();
      console.log('Task created successfully:', result);

      // Close modal
      closeTaskModalHandler();

      // Reload tasks
      if (document.getElementById('tasksTab').classList.contains('active')) {
        loadTasks();
      }

      // Show success message
      alert('Task created successfully!');

    } catch (error) {
      console.error('Error creating task:', error);
      errorMessage.textContent = error.message || 'Failed to create task. Please try again.';
      errorMessage.classList.add('show');
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = originalText;
    }
  }

  // Function to load products
  async function loadProducts() {
    const productsTableBody = document.getElementById('productsTableBody');
    if (!productsTableBody) return;

    try {
      // Try to get products from storage first
      const storedProducts = sessionStorage.getItem('userProducts') || localStorage.getItem('userProducts');
      let products = [];

      if (storedProducts) {
        try {
          const parsed = JSON.parse(storedProducts);
          // Handle both array and object with data property
          if (Array.isArray(parsed)) {
            products = parsed;
          } else if (parsed && Array.isArray(parsed.data)) {
            products = parsed.data;
          }
        } catch (e) {
          console.error('Error parsing stored products:', e);
        }
      }

      // If no stored products, try to fetch from API
      if (products.length === 0 && authToken) {
        const myProductsUrl = window.AppConfig ? window.AppConfig.getMyProductsUrl() : '/api/v1/my-products';
        try {
          const response = await fetch(myProductsUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const responseData = await response.json();
            // Handle API response structure: { success: true, data: [...], message: "..." }
            if (responseData.success && Array.isArray(responseData.data)) {
              products = responseData.data;
            } else if (Array.isArray(responseData)) {
              // Fallback: if response is directly an array
              products = responseData;
            } else {
              console.warn('Unexpected API response structure:', responseData);
            }
            // Store products
            const storage = sessionStorage.getItem('authToken') ? sessionStorage : localStorage;
            storage.setItem('userProducts', JSON.stringify(products));
          }
        } catch (error) {
          console.error('Error fetching products:', error);
        }
      }

      // Display products
      if (products.length === 0) {
        productsTableBody.innerHTML = `
          <tr>
            <td colspan="5" class="loading">No products found. Please opt for products from the registration page.</td>
          </tr>
        `;
        return;
      }

      productsTableBody.innerHTML = products.map(product => {
        // Map API response fields to display fields
        const productName = product.productName || product.name || 'N/A';
        const productId = product.productId || product.id || '';
        const plan = product.plan || product.category || product.type || 'N/A';
        const status = (product.status || '').toLowerCase() || 'inactive';
        const subscriptionDate = product.subscriptionDate || product.optedDate || product.createdDate || product.date || 'N/A';
        
        return `
          <tr>
            <td>${productName}</td>
            <td>${plan}</td>
            <td><span class="status-badge ${status}">${status}</span></td>
            <td>${formatDate(subscriptionDate)}</td>
            <td>
              <button class="action-btn view" onclick="viewProduct('${productId}')">
                <i class="fas fa-eye"></i> View
              </button>
            </td>
          </tr>
        `;
      }).join('');
    } catch (error) {
      console.error('Error loading products:', error);
      productsTableBody.innerHTML = `
        <tr>
          <td colspan="5" class="loading">Error loading products. Please try again later.</td>
        </tr>
      `;
    }
  }

  // Function to load tasks
  async function loadTasks() {
    const tasksTableBody = document.getElementById('tasksTableBody');
    if (!tasksTableBody) return;

    tasksTableBody.innerHTML = '<tr><td colspan="7" class="loading">Loading tasks...</td></tr>';

    try {
      // Try to fetch tasks from API
      const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
      let tasks = [];

      if (token) {
        const tasksUrl = window.AppConfig ? window.AppConfig.getTasksUrl() : '/api/v1/tasks';
        try {
          const response = await fetch(tasksUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const responseData = await response.json();
            // Handle API response structure: { success: true, data: [...], message: "..." }
            if (responseData.success && Array.isArray(responseData.data)) {
              tasks = responseData.data;
            } else if (Array.isArray(responseData)) {
              tasks = responseData;
            }
          }
        } catch (error) {
          console.warn('Failed to fetch tasks from API, using demo data:', error);
        }
      }

      // If no tasks from API, use demo data
      if (tasks.length === 0) {
        tasks = getDemoTasks();
      }

      displayTasks(tasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
      tasksTableBody.innerHTML = `
        <tr>
          <td colspan="7" class="loading">Error loading tasks. Please try again later.</td>
        </tr>
      `;
    }
  }

  function getDemoTasks() {
    // Demo tasks data
    return [
      {
        id: 'TASK-001',
        product: 'Invoice Processor',
        description: 'Process invoice INV-2024-001',
        status: 'completed',
        submittedDate: '2024-01-15T10:30:00',
        completedDate: '2024-01-15T10:35:00'
      },
      {
        id: 'TASK-002',
        product: 'Content Writer',
        description: 'Generate blog post about AI trends',
        status: 'processing',
        submittedDate: '2024-01-16T14:20:00',
        completedDate: null
      },
      {
        id: 'TASK-003',
        product: 'Data Analyst',
        description: 'Analyze sales data for Q4 2023',
        status: 'pending',
        submittedDate: '2024-01-17T09:15:00',
        completedDate: null
      },
      {
        id: 'TASK-004',
        product: 'Invoice Processor',
        description: 'Process invoice INV-2024-002',
        status: 'completed',
        submittedDate: '2024-01-18T11:00:00',
        completedDate: '2024-01-18T11:05:00'
      },
      {
        id: 'TASK-005',
        product: 'Content Writer',
        description: 'Create product description for new feature',
        status: 'failed',
        submittedDate: '2024-01-19T16:45:00',
        completedDate: null
      }
    ];
  }

  function displayTasks(tasks) {
    const tasksTableBody = document.getElementById('tasksTableBody');
    if (!tasksTableBody) return;

    if (tasks.length === 0) {
      tasksTableBody.innerHTML = `
        <tr>
          <td colspan="7" class="loading">No tasks found. Create your first task to get started!</td>
        </tr>
      `;
      return;
    }

    tasksTableBody.innerHTML = tasks.map(task => {
      // Handle different task data structures (API vs demo)
      const taskId = task.id || task.taskId || task.task_id || 'N/A';
      const product = task.product || task.productName || task.product_name || 'N/A';
      const description = task.description || task.taskDescription || task.task_description || 'N/A';
      const status = (task.status || 'pending').toLowerCase();
      const submittedDate = task.submittedDate || task.submitted_date || task.createdDate || task.created_date || task.date || null;
      const completedDate = task.completedDate || task.completed_date || task.finishedDate || task.finished_date || null;

      return `
        <tr>
          <td>${taskId}</td>
          <td>${product}</td>
          <td>${description}</td>
          <td><span class="status-badge ${status}">${status}</span></td>
          <td>${formatDate(submittedDate)}</td>
          <td>${completedDate ? formatDate(completedDate) : '-'}</td>
          <td>
            <button class="action-btn view" onclick="viewTask('${taskId}')">
              <i class="fas fa-eye"></i> View
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Function to load billing (demo data)
  function loadBilling() {
    const billingTableBody = document.getElementById('billingTableBody');
    if (!billingTableBody) return;

    // Demo billing data
    const demoBilling = [
      {
        date: '2024-01-15T10:30:00',
        taskId: 'TASK-001',
        product: 'Invoice Processor',
        taskType: 'Invoice Processing',
        usage: '1 invoice',
        charge: 0.50,
        status: 'paid'
      },
      {
        date: '2024-01-16T14:20:00',
        taskId: 'TASK-002',
        product: 'Content Writer',
        taskType: 'Content Generation',
        usage: '1 article',
        charge: 2.00,
        status: 'pending'
      },
      {
        date: '2024-01-17T09:15:00',
        taskId: 'TASK-003',
        product: 'Data Analyst',
        taskType: 'Data Analysis',
        usage: '1 report',
        charge: 5.00,
        status: 'pending'
      },
      {
        date: '2024-01-18T11:00:00',
        taskId: 'TASK-004',
        product: 'Invoice Processor',
        taskType: 'Invoice Processing',
        usage: '1 invoice',
        charge: 0.50,
        status: 'paid'
      },
      {
        date: '2024-01-19T16:45:00',
        taskId: 'TASK-005',
        product: 'Content Writer',
        taskType: 'Content Generation',
        usage: '1 article',
        charge: 0.00,
        status: 'failed'
      }
    ];

    // Calculate statistics
    const totalCharges = demoBilling.reduce((sum, item) => sum + item.charge, 0);
    const totalTasks = demoBilling.length;
    const completedTasks = demoBilling.filter(item => item.status === 'paid').length;
    const pendingTasks = demoBilling.filter(item => item.status === 'pending').length;

    // Update stats
    document.getElementById('totalCharges').textContent = `$${totalCharges.toFixed(2)}`;
    document.getElementById('totalTasks').textContent = totalTasks;
    document.getElementById('completedTasks').textContent = completedTasks;
    document.getElementById('pendingTasks').textContent = pendingTasks;

    // Display billing table
    billingTableBody.innerHTML = demoBilling.map(item => {
      return `
        <tr>
          <td>${formatDate(item.date)}</td>
          <td>${item.taskId}</td>
          <td>${item.product}</td>
          <td>${item.taskType}</td>
          <td>${item.usage}</td>
          <td>$${item.charge.toFixed(2)}</td>
          <td><span class="status-badge ${item.status}">${item.status}</span></td>
        </tr>
      `;
    }).join('');
  }

  // Helper function to format date
  function formatDate(dateString) {
    if (!dateString || dateString === 'N/A') return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  }

  // Global functions for action buttons
  window.viewProduct = function(productId) {
    alert(`View product details for: ${productId}`);
    // Implement product view functionality
  };

  window.viewTask = function(taskId) {
    alert(`View task details for: ${taskId}`);
    // Implement task view functionality
  };
});

