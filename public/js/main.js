/**
 * Main JavaScript for Massage Booking Website
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize Bootstrap tooltips if Bootstrap is available
  if (typeof bootstrap !== 'undefined') {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Initialize Bootstrap popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function(popoverTriggerEl) {
      return new bootstrap.Popover(popoverTriggerEl);
    });
  }
  
  // Auto-dismiss alerts
  const autoAlerts = document.querySelectorAll('.alert-dismissible.auto-dismiss');
  autoAlerts.forEach(alert => {
    setTimeout(() => {
      const closeButton = alert.querySelector('.btn-close');
      if (closeButton) {
        closeButton.click();
      }
    }, 5000);
  });
  
  // Booking form date validation
  const dateInput = document.getElementById('date');
  if (dateInput) {
    // Set minimum date to today
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    dateInput.min = `${yyyy}-${mm}-${dd}`;
    
    // Set maximum date to 3 months from now
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    const maxYyyy = maxDate.getFullYear();
    const maxMm = String(maxDate.getMonth() + 1).padStart(2, '0');
    const maxDd = String(maxDate.getDate()).padStart(2, '0');
    dateInput.max = `${maxYyyy}-${maxMm}-${maxDd}`;
  }
  
  // Admin dashboard date range picker
  const startDateInput = document.getElementById('startDate');
  const endDateInput = document.getElementById('endDate');
  
  if (startDateInput && endDateInput) {
    startDateInput.addEventListener('change', function() {
      endDateInput.min = startDateInput.value;
    });
    
    endDateInput.addEventListener('change', function() {
      startDateInput.max = endDateInput.value;
    });
  }
  
  // Form validation
  const forms = document.querySelectorAll('.needs-validation');
  
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }
      
      form.classList.add('was-validated');
    }, false);
  });

  // Add active class to current nav item
  const currentLocation = window.location.pathname;
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentLocation || 
        (href !== '/' && currentLocation.startsWith(href))) {
      link.classList.add('active');
    }
  });
});
