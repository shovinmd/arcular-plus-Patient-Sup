// Patient Supervisor Dashboard JavaScript
// Global variables
let currentUser = null;
let dashboardData = {
    totalPatients: 0,
    activeTickets: 0,
    resolvedTickets: 0,
    avgResponseTime: '2.5h'
};

// Backend API configuration
const API_BASE_URL = 'https://arcular-plus-backend.onrender.com/api';

// Firebase configuration (same as ARC Staff)
const firebaseConfig = {
    apiKey: "AIzaSyBzK4SQ44cv6k8EiNF9B2agNASArWQrstk",
    authDomain: "arcularplus-7e66c.firebaseapp.com",
    projectId: "arcularplus-7e66c",
    storageBucket: "arcularplus-7e66c.firebasestorage.app",
    messagingSenderId: "239874151024",
    appId: "1:239874151024:android:7e0d9de0400c6bb9fb5ab5"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// DOM Elements
const loadingState = document.getElementById('loadingState');
const dashboardContent = document.getElementById('dashboardContent');
const userName = document.getElementById('userName');
const userEmail = document.getElementById('userEmail');
const settingsModal = document.getElementById('settingsModal');
const messageContainer = document.getElementById('messageContainer');

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Patient Supervisor Dashboard initializing...');
    initializeDashboard();
});

// Main initialization function
async function initializeDashboard() {
    try {
        // Check authentication status
        await checkAuthStatus();
        
        // Initialize navigation
        initializeNavigation();
        
        // Initialize settings
        initializeSettings();
        
        // Load dashboard data
        await loadDashboardData();
        
        // Show dashboard content
        showDashboard();
        
        console.log('✅ Patient Supervisor Dashboard initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing dashboard:', error);
        showMessage('Error initializing dashboard. Please refresh the page.', 'error');
    }
}

// Check authentication status
async function checkAuthStatus() {
    return new Promise((resolve, reject) => {
        firebase.auth().onAuthStateChanged(async (user) => {
            if (user) {
                console.log('✅ Firebase user authenticated:', user.email);
                
                // Get staff type from localStorage
                const staffType = localStorage.getItem('staff_type');
                if (staffType !== 'patient_supervisor') {
                    console.log('❌ User is not a Patient Supervisor, redirecting to staff login...');
                    window.location.href = 'https://arcular-plus-staffs.vercel.app/';
                    return;
                }
                
                // Get staff ID token
                const idToken = await user.getIdToken();
                localStorage.setItem('staff_idToken', idToken);
                
                // Set current user
                currentUser = {
                    uid: user.uid,
                    email: user.email,
                    staffType: staffType
                };
                
                // Update user display
                updateUserDisplay();
                
                resolve();
            } else {
                console.log('❌ No user authenticated, redirecting to login...');
                window.location.href = 'https://arcular-plus-staffs.vercel.app/';
                reject(new Error('No user authenticated'));
            }
        });
    });
}

// Update user display
function updateUserDisplay() {
    if (currentUser) {
        userName.textContent = 'Patient Supervisor';
        userEmail.textContent = currentUser.email;
    }
}

// Initialize navigation
function initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Show corresponding section
            const section = this.getAttribute('data-section');
            showSection(section);
        });
    });
}

// Show specific section
function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => section.classList.remove('active'));
    
    // Show selected section
    const targetSection = document.getElementById(sectionName + 'Section');
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Load section-specific data
        loadSectionData(sectionName);
    }
}

// Load section-specific data
async function loadSectionData(sectionName) {
    try {
        switch (sectionName) {
            case 'overview':
                await loadOverviewData();
                break;
            case 'patient-search':
                initializePatientSearch();
                break;
            case 'active-tickets':
                await loadActiveTickets();
                break;
            case 'resolved-tickets':
                await loadResolvedTickets();
                break;
            case 'patient-issues':
                await loadCommonIssues();
                break;
            case 'knowledge-base':
                await loadKnowledgeBase();
                break;
            case 'reports':
                await loadReportsData();
                break;
        }
    } catch (error) {
        console.error(`❌ Error loading ${sectionName} data:`, error);
        showMessage(`Error loading ${sectionName} data`, 'error');
    }
}

// Initialize patient search functionality
function initializePatientSearch() {
    const searchTabs = document.querySelectorAll('.search-tab');
    const searchInputs = document.querySelectorAll('.search-input');
    
    searchTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const method = this.getAttribute('data-method');
            
            // Update active tab
            searchTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding input
            searchInputs.forEach(input => input.classList.remove('active'));
            document.getElementById(method + 'Search').classList.add('active');
        });
    });
}

// Search patient by email
async function searchByEmail() {
    const email = document.getElementById('emailInput').value.trim();
    
    if (!email) {
        showMessage('Please enter an email address', 'error');
        return;
    }
    
    try {
        showSearchLoading();
        
        // Simulate API call (replace with actual backend endpoint)
        const response = await fetch(`/api/patient-supervisor/search-patient?email=${encodeURIComponent(email)}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('staff_idToken')}`
            }
        });
        
        if (response.ok) {
            const patient = await response.json();
            displaySearchResults(patient);
        } else {
            showSearchError('Patient not found');
        }
    } catch (error) {
        console.error('❌ Error searching patient:', error);
        showSearchError('Error searching for patient');
    }
}

// Search patient by ARC ID
async function searchByArcId() {
    const arcId = document.getElementById('arcidInput').value.trim();
    
    if (!arcId) {
        showMessage('Please enter an ARC ID', 'error');
        return;
    }
    
    try {
        showSearchLoading();
        
        // Simulate API call (replace with actual backend endpoint)
        const response = await fetch(`/api/patient-supervisor/search-patient?arcId=${encodeURIComponent(arcId)}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('staff_idToken')}`
            }
        });
        
        if (response.ok) {
            const patient = await response.json();
            displaySearchResults(patient);
        } else {
            showSearchError('Patient not found');
        }
    } catch (error) {
        console.error('❌ Error searching patient:', error);
        showSearchError('Error searching for patient');
    }
}

// Search patient by phone
async function searchByPhone() {
    const phone = document.getElementById('phoneInput').value.trim();
    
    if (!phone) {
        showMessage('Please enter a phone number', 'error');
        return;
    }
    
    try {
        showSearchLoading();
        
        // Simulate API call (replace with actual backend endpoint)
        const response = await fetch(`/api/patient-supervisor/search-patient?phone=${encodeURIComponent(phone)}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('staff_idToken')}`
            }
        });
        
        if (response.ok) {
            const patient = await response.json();
            displaySearchResults(patient);
        } else {
            showSearchError('Patient not found');
        }
    } catch (error) {
        console.error('❌ Error searching patient:', error);
        showSearchError('Error searching for patient');
    }
}

// Show search loading state
function showSearchLoading() {
    const searchResults = document.getElementById('searchResults');
    searchResults.innerHTML = `
        <div class="search-loading">
            <div class="loading-spinner">
                <div class="spinner-ring"></div>
            </div>
            <p>Searching for patient...</p>
        </div>
    `;
}

// Show search error
function showSearchError(message) {
    const searchResults = document.getElementById('searchResults');
    searchResults.innerHTML = `
        <div class="search-error">
            <i class="fas fa-exclamation-circle"></i>
            <p>${message}</p>
        </div>
    `;
}

// Display search results
function displaySearchResults(patient) {
    const searchResults = document.getElementById('searchResults');
    
    searchResults.innerHTML = `
        <div class="patient-result">
            <div class="patient-header">
                <h3>Patient Found</h3>
                <button class="btn btn-primary" onclick="createSupportTicket('${patient.id}')">
                    <i class="fas fa-plus"></i> Create Support Ticket
                </button>
            </div>
            
            <div class="patient-details">
                <div class="detail-row">
                    <span class="detail-label">Name:</span>
                    <span class="detail-value">${patient.name}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">ARC ID:</span>
                    <span class="detail-value">${patient.arcId}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Email:</span>
                    <span class="detail-value">${patient.email}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Phone:</span>
                    <span class="detail-value">${patient.phone}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Status:</span>
                    <span class="detail-value status-${patient.status}">${patient.status}</span>
                </div>
            </div>
            
            <div class="patient-actions">
                <button class="btn btn-secondary" onclick="viewPatientHistory('${patient.id}')">
                    <i class="fas fa-history"></i> View History
                </button>
                <button class="btn btn-info" onclick="editPatientInfo('${patient.id}')">
                    <i class="fas fa-edit"></i> Edit Info
                </button>
                <button class="btn btn-warning" onclick="resetPatientPassword('${patient.id}')">
                    <i class="fas fa-key"></i> Reset Password
                </button>
            </div>
        </div>
    `;
}

// Create support ticket
async function createSupportTicket(patientId) {
    try {
        // Show ticket creation modal or redirect to ticket creation page
        showMessage('Redirecting to ticket creation...', 'info');
        
        // Simulate API call to create ticket
        const response = await fetch('/api/patient-supervisor/create-ticket', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('staff_idToken')}`
            },
            body: JSON.stringify({
                patientId: patientId,
                supervisorId: currentUser.uid,
                priority: 'medium',
                status: 'open'
            })
        });
        
        if (response.ok) {
            showMessage('Support ticket created successfully', 'success');
            // Refresh active tickets
            await loadActiveTickets();
        } else {
            showMessage('Error creating support ticket', 'error');
        }
    } catch (error) {
        console.error('❌ Error creating ticket:', error);
        showMessage('Error creating support ticket', 'error');
    }
}

// View patient history
async function viewPatientHistory(patientId) {
    try {
        showMessage('Loading patient history...', 'info');
        
        // Simulate API call to get patient history
        const response = await fetch(`/api/patient-supervisor/patient-history/${patientId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('staff_idToken')}`
            }
        });
        
        if (response.ok) {
            const history = await response.json();
            displayPatientHistory(history);
        } else {
            showMessage('Error loading patient history', 'error');
        }
    } catch (error) {
        console.error('❌ Error loading patient history:', error);
        showMessage('Error loading patient history', 'error');
    }
}

// Display patient history
function displayPatientHistory(history) {
    // Create modal to display patient history
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content large-modal">
            <div class="modal-header">
                <h3>Patient History</h3>
                <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            </div>
            <div class="modal-body">
                <div class="history-timeline">
                    ${history.events.map(event => `
                        <div class="timeline-item">
                            <div class="timeline-date">${formatDate(event.date)}</div>
                            <div class="timeline-content">
                                <h4>${event.title}</h4>
                                <p>${event.description}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
}

// Edit patient info
async function editPatientInfo(patientId) {
    try {
        showMessage('Loading patient information for editing...', 'info');
        
        // Simulate API call to get patient info
        const response = await fetch(`/api/patient-supervisor/patient-info/${patientId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('staff_idToken')}`
            }
        });
        
        if (response.ok) {
            const patient = await response.json();
            showEditPatientModal(patient);
        } else {
            showMessage('Error loading patient information', 'error');
        }
    } catch (error) {
        console.error('❌ Error loading patient info:', error);
        showMessage('Error loading patient information', 'error');
    }
}

// Show edit patient modal
function showEditPatientModal(patient) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content large-modal">
            <div class="modal-header">
                <h3>Edit Patient Information</h3>
                <span class="close" onclick="this.closest('.modal').remove()">&times;</span>
            </div>
            <div class="modal-body">
                <form id="editPatientForm">
                    <div class="form-group">
                        <label for="editName">Name</label>
                        <input type="text" id="editName" value="${patient.name}" required>
                    </div>
                    <div class="form-group">
                        <label for="editEmail">Email</label>
                        <input type="email" id="editEmail" value="${patient.email}" required>
                    </div>
                    <div class="form-group">
                        <label for="editPhone">Phone</label>
                        <input type="tel" id="editPhone" value="${patient.phone}" required>
                    </div>
                    <div class="form-group">
                        <label for="editStatus">Status</label>
                        <select id="editStatus" required>
                            <option value="active" ${patient.status === 'active' ? 'selected' : ''}>Active</option>
                            <option value="suspended" ${patient.status === 'suspended' ? 'selected' : ''}>Suspended</option>
                            <option value="inactive" ${patient.status === 'inactive' ? 'selected' : ''}>Inactive</option>
                        </select>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" onclick="savePatientChanges('${patient.id}')">
                    <i class="fas fa-save"></i> Save Changes
                </button>
                <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'block';
}

// Save patient changes
async function savePatientChanges(patientId) {
    try {
        const formData = {
            name: document.getElementById('editName').value,
            email: document.getElementById('editEmail').value,
            phone: document.getElementById('editPhone').value,
            status: document.getElementById('editStatus').value
        };
        
        // Simulate API call to update patient
        const response = await fetch(`/api/patient-supervisor/update-patient/${patientId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('staff_idToken')}`
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            showMessage('Patient information updated successfully', 'success');
            document.querySelector('.modal').remove();
            // Refresh search results if needed
        } else {
            showMessage('Error updating patient information', 'error');
        }
    } catch (error) {
        console.error('❌ Error updating patient:', error);
        showMessage('Error updating patient information', 'error');
    }
}

// Reset patient password
async function resetPatientPassword(patientId) {
    try {
        if (confirm('Are you sure you want to reset this patient\'s password?')) {
            showMessage('Resetting patient password...', 'info');
            
            // Simulate API call to reset password
            const response = await fetch(`/api/patient-supervisor/reset-password/${patientId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('staff_idToken')}`
                }
            });
            
            if (response.ok) {
                const result = await response.json();
                showMessage(`Password reset successfully. New password: ${result.newPassword}`, 'success');
            } else {
                showMessage('Error resetting password', 'error');
            }
        }
    } catch (error) {
        console.error('❌ Error resetting password:', error);
        showMessage('Error resetting password', 'error');
    }
}

// Load overview data
async function loadOverviewData() {
    try {
        // Simulate API call to get overview data
        const response = await fetch('/api/patient-supervisor/overview', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('staff_idToken')}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            updateOverviewStats(data);
        } else {
            // Use mock data for development
            updateOverviewStats({
                totalPatients: 1250,
                activeTickets: 23,
                resolvedTickets: 45,
                avgResponseTime: '2.5h'
            });
        }
    } catch (error) {
        console.error('❌ Error loading overview data:', error);
        // Use mock data for development
        updateOverviewStats({
            totalPatients: 1250,
            activeTickets: 23,
            resolvedTickets: 45,
            avgResponseTime: '2.5h'
        });
    }
}

// Update overview statistics
function updateOverviewStats(data) {
    document.getElementById('totalPatients').textContent = data.totalPatients;
    document.getElementById('activeTickets').textContent = data.activeTickets;
    document.getElementById('resolvedTickets').textContent = data.resolvedTickets;
    document.getElementById('avgResponseTime').textContent = data.avgResponseTime;
    
    // Update notification badge
    document.getElementById('activeTicketCount').textContent = data.activeTickets;
}

// Load active tickets
async function loadActiveTickets() {
    try {
        // Simulate API call to get active tickets
        const response = await fetch('/api/patient-supervisor/active-tickets', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('staff_idToken')}`
            }
        });
        
        if (response.ok) {
            const tickets = await response.json();
            displayActiveTickets(tickets);
        } else {
            // Use mock data for development
            displayActiveTickets(getMockActiveTickets());
        }
    } catch (error) {
        console.error('❌ Error loading active tickets:', error);
        // Use mock data for development
        displayActiveTickets(getMockActiveTickets());
    }
}

// Get mock active tickets
function getMockActiveTickets() {
    return [
        {
            id: '1',
            patientName: 'John Doe',
            patientEmail: 'john.doe@example.com',
            issue: 'Cannot upload medical reports',
            priority: 'high',
            status: 'open',
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            lastUpdated: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
        },
        {
            id: '2',
            patientName: 'Jane Smith',
            patientEmail: 'jane.smith@example.com',
            issue: 'App crashes on startup',
            priority: 'medium',
            status: 'in_progress',
            createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
            lastUpdated: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
        }
    ];
}

// Display active tickets
function displayActiveTickets(tickets) {
    const ticketsList = document.getElementById('activeTicketsList');
    
    if (tickets.length === 0) {
        ticketsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-check-circle"></i>
                <h3>No Active Tickets</h3>
                <p>All patient support tickets have been resolved!</p>
            </div>
        `;
        return;
    }
    
    ticketsList.innerHTML = tickets.map(ticket => `
        <div class="ticket-item priority-${ticket.priority}">
            <div class="ticket-header">
                <div class="ticket-info">
                    <h4>${ticket.issue}</h4>
                    <div class="ticket-meta">
                        <span class="patient-name">${ticket.patientName}</span>
                        <span class="patient-email">${ticket.patientEmail}</span>
                        <span class="ticket-date">Created: ${formatDate(ticket.createdAt)}</span>
                    </div>
                </div>
                <div class="ticket-status">
                    <span class="priority-badge priority-${ticket.priority}">${ticket.priority}</span>
                    <span class="status-badge status-${ticket.status}">${ticket.status}</span>
                </div>
            </div>
            <div class="ticket-actions">
                <button class="btn btn-primary btn-sm" onclick="viewTicketDetails('${ticket.id}')">
                    <i class="fas fa-eye"></i> View Details
                </button>
                <button class="btn btn-success btn-sm" onclick="resolveTicket('${ticket.id}')">
                    <i class="fas fa-check"></i> Resolve
                </button>
                <button class="btn btn-warning btn-sm" onclick="escalateTicket('${ticket.id}')">
                    <i class="fas fa-arrow-up"></i> Escalate
                </button>
            </div>
        </div>
    `).join('');
}

// Load resolved tickets
async function loadResolvedTickets() {
    try {
        // Simulate API call to get resolved tickets
        const response = await fetch('/api/patient-supervisor/resolved-tickets', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('staff_idToken')}`
            }
        });
        
        if (response.ok) {
            const tickets = await response.json();
            displayResolvedTickets(tickets);
        } else {
            // Use mock data for development
            displayResolvedTickets(getMockResolvedTickets());
        }
    } catch (error) {
        console.error('❌ Error loading resolved tickets:', error);
        // Use mock data for development
        displayResolvedTickets(getMockResolvedTickets());
    }
}

// Get mock resolved tickets
function getMockResolvedTickets() {
    return [
        {
            id: '3',
            patientName: 'Mike Johnson',
            patientEmail: 'mike.johnson@example.com',
            issue: 'Forgot password',
            resolution: 'Password reset and new password sent via email',
            resolvedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
            resolutionTime: '45 minutes'
        }
    ];
}

// Display resolved tickets
function displayResolvedTickets(tickets) {
    const ticketsList = document.getElementById('resolvedTicketsList');
    
    if (tickets.length === 0) {
        ticketsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-info-circle"></i>
                <h3>No Resolved Tickets</h3>
                <p>No tickets have been resolved yet.</p>
            </div>
        `;
        return;
    }
    
    ticketsList.innerHTML = tickets.map(ticket => `
        <div class="ticket-item resolved">
            <div class="ticket-header">
                <div class="ticket-info">
                    <h4>${ticket.issue}</h4>
                    <div class="ticket-meta">
                        <span class="patient-name">${ticket.patientName}</span>
                        <span class="patient-email">${ticket.patientEmail}</span>
                        <span class="resolution-time">Resolved in: ${ticket.resolutionTime}</span>
                    </div>
                </div>
                <div class="ticket-status">
                    <span class="status-badge status-resolved">Resolved</span>
                    <span class="resolved-date">${formatDate(ticket.resolvedAt)}</span>
                </div>
            </div>
            <div class="ticket-resolution">
                <strong>Resolution:</strong> ${ticket.resolution}
            </div>
        </div>
    `).join('');
}

// Load common issues
async function loadCommonIssues() {
    try {
        // Simulate API call to get common issues
        const response = await fetch('/api/patient-supervisor/common-issues', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('staff_idToken')}`
            }
        });
        
        if (response.ok) {
            const issues = await response.json();
            displayCommonIssues(issues);
        } else {
            // Use mock data for development
            displayCommonIssues(getMockCommonIssues());
        }
    } catch (error) {
        console.error('❌ Error loading common issues:', error);
        // Use mock data for development
        displayCommonIssues(getMockCommonIssues());
    }
}

// Get mock common issues
function getMockCommonIssues() {
    return {
        categories: [
            { name: 'Account Access', count: 15, icon: 'user-lock' },
            { name: 'App Problems', count: 23, icon: 'mobile-alt' },
            { name: 'Report Issues', count: 8, icon: 'file-medical' },
            { name: 'Payment Issues', count: 12, icon: 'credit-card' }
        ],
        trending: [
            { issue: 'App crashes on startup', count: 8, trend: 'up' },
            { issue: 'Cannot upload documents', count: 6, trend: 'up' },
            { issue: 'Login authentication failed', count: 4, trend: 'down' }
        ]
    };
}

// Display common issues
function displayCommonIssues(data) {
    // Update category cards
    const categoryCards = document.querySelectorAll('.category-card');
    data.categories.forEach((category, index) => {
        if (categoryCards[index]) {
            const iconElement = categoryCards[index].querySelector('.category-header i');
            const nameElement = categoryCards[index].querySelector('.category-header h3');
            const countElement = categoryCards[index].querySelector('.issue-count');
            
            if (iconElement) iconElement.className = `fas fa-${category.icon}`;
            if (nameElement) nameElement.textContent = category.name;
            if (countElement) countElement.textContent = `${category.count} issues`;
        }
    });
    
    // Update trending issues
    const trendingList = document.getElementById('trendingIssuesList');
    if (trendingList) {
        trendingList.innerHTML = data.trending.map(issue => `
            <div class="trending-item trend-${issue.trend}">
                <div class="trending-content">
                    <h4>${issue.issue}</h4>
                    <span class="trending-count">${issue.count} reports</span>
                </div>
                <div class="trending-icon">
                    <i class="fas fa-arrow-${issue.trend}"></i>
                </div>
            </div>
        `).join('');
    }
}

// Load knowledge base
async function loadKnowledgeBase() {
    try {
        // Simulate API call to get knowledge base
        const response = await fetch('/api/patient-supervisor/knowledge-base', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('staff_idToken')}`
            }
        });
        
        if (response.ok) {
            const kb = await response.json();
            displayKnowledgeBase(kb);
        } else {
            // Use mock data for development
            displayKnowledgeBase(getMockKnowledgeBase());
        }
    } catch (error) {
        console.error('❌ Error loading knowledge base:', error);
        // Use mock data for development
        displayKnowledgeBase(getMockKnowledgeBase());
    }
}

// Get mock knowledge base
function getMockKnowledgeBase() {
    return {
        articles: [
            {
                id: '1',
                title: 'How to Reset Your Password',
                category: 'Account Management',
                content: 'Step-by-step guide to reset your password...',
                tags: ['password', 'account', 'security']
            },
            {
                id: '2',
                title: 'Uploading Medical Reports',
                category: 'App Features',
                content: 'Learn how to upload and manage your medical reports...',
                tags: ['reports', 'upload', 'documents']
            }
        ]
    };
}

// Display knowledge base
function displayKnowledgeBase(data) {
    const kbArticles = document.getElementById('kbArticles');
    if (kbArticles) {
        kbArticles.innerHTML = data.articles.map(article => `
            <div class="kb-article">
                <div class="article-header">
                    <h4>${article.title}</h4>
                    <span class="article-category">${article.category}</span>
                </div>
                <div class="article-content">
                    <p>${article.content}</p>
                </div>
                <div class="article-tags">
                    ${article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <button class="btn btn-primary btn-sm" onclick="viewArticle('${article.id}')">
                    <i class="fas fa-book-open"></i> Read More
                </button>
            </div>
        `).join('');
    }
}

// Load reports data
async function loadReportsData() {
    try {
        // Simulate API call to get reports data
        const response = await fetch('/api/patient-supervisor/reports', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('staff_idToken')}`
            }
        });
        
        if (response.ok) {
            const reports = await response.json();
            displayReportsData(reports);
        } else {
            // Use mock data for development
            displayReportsData(getMockReportsData());
        }
    } catch (error) {
        console.error('❌ Error loading reports data:', error);
        // Use mock data for development
        displayReportsData(getMockReportsData());
    }
}

// Get mock reports data
function getMockReportsData() {
    return {
        metrics: {
            responseTime: '2.5 hours',
            resolutionRate: '94%',
            satisfaction: '4.7/5'
        },
        trends: {
            responseTime: 'down',
            resolutionRate: 'up',
            satisfaction: 'up'
        }
    };
}

// Display reports data
function displayReportsData(data) {
    // Update metric cards
    const metricCards = document.querySelectorAll('.metric-card');
    if (metricCards.length >= 3) {
        const responseTimeElement = metricCards[0].querySelector('.metric-value');
        const resolutionRateElement = metricCards[1].querySelector('.metric-value');
        const satisfactionElement = metricCards[2].querySelector('.metric-value');
        
        if (responseTimeElement) responseTimeElement.textContent = data.metrics.responseTime;
        if (resolutionRateElement) resolutionRateElement.textContent = data.metrics.resolutionRate;
        if (satisfactionElement) satisfactionElement.textContent = data.metrics.satisfaction;
    }
}

// Initialize settings
function initializeSettings() {
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const closeBtn = settingsModal.querySelector('.close');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    const cancelSettingsBtn = document.getElementById('cancelSettingsBtn');
    
    // Open settings modal
    settingsBtn.addEventListener('click', () => {
        settingsModal.style.display = 'block';
        loadSettings();
    });
    
    // Close settings modal
    closeBtn.addEventListener('click', () => {
        settingsModal.style.display = 'none';
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === settingsModal) {
            settingsModal.style.display = 'none';
        }
    });
    
    // Save settings
    saveSettingsBtn.addEventListener('click', saveSettings);
    
    // Cancel settings
    cancelSettingsBtn.addEventListener('click', () => {
        settingsModal.style.display = 'none';
    });
}

// Load settings
function loadSettings() {
    // Load saved settings from localStorage or API
    const settings = JSON.parse(localStorage.getItem('patient_supervisor_settings')) || {
        ticketNotifications: true,
        urgentTicketNotifications: true,
        patientResponseNotifications: true,
        autoResponseEnabled: 'true',
        responseDelay: 30
    };
    
    // Apply settings to form
    document.getElementById('ticketNotifications').checked = settings.ticketNotifications;
    document.getElementById('urgentTicketNotifications').checked = settings.urgentTicketNotifications;
    document.getElementById('patientResponseNotifications').checked = settings.patientResponseNotifications;
    document.getElementById('autoResponseEnabled').value = settings.autoResponseEnabled;
    document.getElementById('responseDelay').value = settings.responseDelay;
}

// Save settings
async function saveSettings() {
    try {
        const settings = {
            ticketNotifications: document.getElementById('ticketNotifications').checked,
            urgentTicketNotifications: document.getElementById('urgentTicketNotifications').checked,
            patientResponseNotifications: document.getElementById('patientResponseNotifications').checked,
            autoResponseEnabled: document.getElementById('autoResponseEnabled').value,
            responseDelay: parseInt(document.getElementById('responseDelay').value)
        };
        
        // Save to localStorage
        localStorage.setItem('patient_supervisor_settings', JSON.stringify(settings));
        
        // Save to backend (simulate API call)
        const response = await fetch('/api/patient-supervisor/save-settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('staff_idToken')}`
            },
            body: JSON.stringify(settings)
        });
        
        if (response.ok) {
            showMessage('Settings saved successfully', 'success');
            settingsModal.style.display = 'none';
        } else {
            showMessage('Error saving settings', 'error');
        }
    } catch (error) {
        console.error('❌ Error saving settings:', error);
        showMessage('Error saving settings', 'error');
    }
}

// Load dashboard data
async function loadDashboardData() {
    try {
        // Load all dashboard data
        await Promise.all([
            loadOverviewData(),
            loadCommonIssues()
        ]);
    } catch (error) {
        console.error('❌ Error loading dashboard data:', error);
    }
}

// Show dashboard
function showDashboard() {
    loadingState.style.display = 'none';
    dashboardContent.style.display = 'block';
}

// Show message
function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    messageContainer.appendChild(messageDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// Format date
function formatDate(date) {
    if (!date) return 'N/A';
    
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) {
        return `${minutes} minutes ago`;
    } else if (hours < 24) {
        return `${hours} hours ago`;
    } else if (days < 7) {
        return `${days} days ago`;
    } else {
        return new Date(date).toLocaleDateString();
    }
}

// Event listeners for other buttons
document.addEventListener('DOMContentLoaded', function() {
    // Refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async () => {
            refreshBtn.querySelector('i').classList.add('fa-spin');
            await loadDashboardData();
            refreshBtn.querySelector('i').classList.remove('fa-spin');
            showMessage('Dashboard refreshed successfully', 'success');
        });
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
                    try {
            await firebase.auth().signOut();
            localStorage.removeItem('staff_idToken');
            localStorage.removeItem('staff_type');
            window.location.href = 'https://arcular-plus-staffs.vercel.app/';
        } catch (error) {
            console.error('❌ Error logging out:', error);
            showMessage('Error logging out', 'error');
        }
        });
    }
    
    // Refresh issues button
    const refreshIssuesBtn = document.getElementById('refreshIssuesBtn');
    if (refreshIssuesBtn) {
        refreshIssuesBtn.addEventListener('click', async () => {
            refreshIssuesBtn.querySelector('i').classList.add('fa-spin');
            await loadCommonIssues();
            refreshIssuesBtn.querySelector('i').classList.remove('fa-spin');
            showMessage('Issues refreshed successfully', 'success');
        });
    }
});

// Additional utility functions
function viewTicketDetails(ticketId) {
    showMessage(`Viewing ticket details for ticket ${ticketId}`, 'info');
    // Implement ticket details view
}

function resolveTicket(ticketId) {
    showMessage(`Resolving ticket ${ticketId}`, 'info');
    // Implement ticket resolution
}

function escalateTicket(ticketId) {
    showMessage(`Escalating ticket ${ticketId}`, 'info');
    // Implement ticket escalation
}

function viewArticle(articleId) {
    showMessage(`Viewing article ${articleId}`, 'info');
    // Implement article view
}

function viewCategoryIssues(category) {
    showMessage(`Viewing issues for category: ${category}`, 'info');
    // Implement category issues view
}

function searchKnowledgeBase() {
    const query = document.getElementById('kbSearch').value.trim();
    if (query) {
        showMessage(`Searching knowledge base for: ${query}`, 'info');
        // Implement knowledge base search
    } else {
        showMessage('Please enter a search query', 'error');
    }
}

function generateSupportReport() {
    showMessage('Generating support report...', 'info');
    // Implement report generation
}

function exportSupportData() {
    showMessage('Exporting support data...', 'info');
    // Implement data export
}

function viewSupportAnalytics() {
    showMessage('Loading support analytics...', 'info');
    // Implement analytics view
}

// Export functions for global access
window.viewTicketDetails = viewTicketDetails;
window.resolveTicket = resolveTicket;
window.escalateTicket = escalateTicket;
window.viewArticle = viewArticle;
window.viewCategoryIssues = viewCategoryIssues;
window.searchKnowledgeBase = searchKnowledgeBase;
window.generateSupportReport = generateSupportReport;
window.exportSupportData = exportSupportData;
window.viewSupportAnalytics = viewSupportAnalytics;
