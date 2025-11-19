document.addEventListener('DOMContentLoaded', () => {

    /* =========================
      1) UTILITY HELPERS
      ========================= */

    /**
     * Finds and returns an element or array of elements.
     * @param {string} selector - The CSS selector string.
     * @param {boolean} all - Whether to return all matching elements (NodeList).
     * @returns {Element|NodeList|null}
     */
    const $ = (selector, all = false) => {
        const context = document;
        if (all) return context.querySelectorAll(selector);
        return context.querySelector(selector);
    };

    /* =========================
      2) ACCORDION (For index.html)
      ========================= */

    const accordionHeaders = $('section.accordion-container .accordion-header', true);
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const panel = header.nextElementSibling;
            const isActive = header.classList.toggle('active');

            if (isActive) {
                // Open the panel
                panel.style.maxHeight = panel.scrollHeight + "px";
                header.style.backgroundColor = '#e6d8c4'; // Light hover effect when open
            } else {
                // Close the panel
                panel.style.maxHeight = null;
                header.style.backgroundColor = 'transparent'; 
            }
        });

        // Initialize panels to be closed and set styling
        const panel = header.nextElementSibling;
        panel.style.maxHeight = null;
        panel.style.overflow = 'hidden';
        panel.style.transition = 'max-height 0.2s ease-out';
        panel.style.padding = '0 15px';
    });


    /* =========================
      3) TABS (For contact-us.html)
      ========================= */

    const tabButtons = $('.tab-button', true);
    const tabContents = $('.tab-content', true);

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const target = button.dataset.tabTarget;

            // Deactivate all buttons and hide all content
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.style.display = 'none');

            // Activate the clicked button and show the corresponding content
            button.classList.add('active');
            const targetContent = $(`[data-tab-content="${target}"]`);
            if (targetContent) {
                targetContent.style.display = 'block';

                // Specific map resize for Leaflet, necessary when map is initially hidden
                if (target === 'map' && typeof window.mapInstance !== 'undefined') {
                    window.mapInstance.invalidateSize();
                }
            }
        });
    });


    /* =========================
      4) DYNAMIC PRODUCTS, SEARCH, FILTER, SORT 
      ========================= */

    const productsData = [
        { id: 1, name: "Engraved Teacher Plaque", price: 150.00, category: "Teacher Gifts", image: "_images/teach2.png.jpeg" },
        { id: 2, name: "Personalised Wall Art", price: 250.00, category: "Room Decor", image: "_images/clock1.png.jpeg" },
        { id: 3, name: "Wooden Birthday Box", price: 180.00, category: "Birthday Gifts", image: "_images/hbd2.png.jpeg" },
        { id: 4, name: "Custom Name Sign", price: 120.00, category: "Room Decor", image: "_images/decor2.png.jpeg" },
        { id: 5, name: "Mothers Day Frame", price: 170.00, category: "Special Occasions", image: "_images/hbd1.png.jpeg" },
        { id: 6, name: "Thank You Teacher Gift", price: 140.00, category: "Teacher Gifts", image: "_images/teach1.png.jpeg" },
    ];

    const productsContainer = $('#dynamicProducts');
    const searchInput = $('#productSearch');
    const filterSelect = $('#productFilter');
    const sortSelect = $('#productSort');

    // Function to render products (only for dynamic section)
    const renderProducts = (products) => {
        if (!productsContainer) return;
        productsContainer.innerHTML = '';

        if (products.length === 0) {
            productsContainer.innerHTML = '<p class="text-center w-full">No products found matching your criteria.</p>';
            return;
        }

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <img src="${product.image}" alt="${product.name}" class="product-card-img" data-product-name="${product.name}" 
                     onerror="this.onerror=null;this.src='https://placehold.co/300x250/ccc/333?text=Image+Missing';">
                <div class="product-card-body">
                    <h3 class="product-card-title">${product.name}</h3>
                    <p class="product-card-category">${product.category}</p>
                    <p class="product-card-price">R ${product.price.toFixed(2)}</p>
                </div>
            `;
            productsContainer.appendChild(card);
        });

        // Re-attach lightbox listeners after rendering dynamic content
        attachLightboxListeners();
    };

    // Main filtering, searching, and sorting logic
    const updateProductsView = () => {
        let currentProducts = [...productsData];

        // 1. Search
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        if (searchTerm) {
            currentProducts = currentProducts.filter(p => 
                p.name.toLowerCase().includes(searchTerm) || 
                p.category.toLowerCase().includes(searchTerm)
            );
        }

        // 2. Filter
        const filterCategory = filterSelect ? filterSelect.value : 'all';
        if (filterCategory !== 'all') {
            currentProducts = currentProducts.filter(p => p.category === filterCategory);
        }

        // 3. Sort
        const sortValue = sortSelect ? sortSelect.value : 'name-asc';
        currentProducts.sort((a, b) => {
            switch (sortValue) {
                case 'name-asc': return a.name.localeCompare(b.name);
                case 'name-desc': return b.name.localeCompare(a.name);
                case 'price-asc': return a.price - b.price;
                case 'price-desc': return b.price - a.price;
                default: return 0;
            }
        });

        renderProducts(currentProducts);
    };

    // Attach listeners for controls
    if (searchInput) searchInput.addEventListener('input', updateProductsView);
    if (filterSelect) filterSelect.addEventListener('change', updateProductsView);
    if (sortSelect) sortSelect.addEventListener('change', updateProductsView);

    // Initial render for dynamic products
    if (productsContainer) updateProductsView();


    /* =========================
      5) LIGHTBOX / GALLERY (Applied to ALL product images on the page)
      ========================= */

    const lightboxHTML = `
        <div id="lightboxOverlay" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:1000; justify-content:center; align-items:center;">
            <div id="lightboxContent" style="background:white; padding:20px; border-radius:10px; max-width:90%; max-height:90%; position:relative;">
                <span id="lightboxClose" style="position:absolute; top:10px; right:20px; color:white; font-size:30px; font-weight:bold; cursor:pointer; background:darkred; border-radius:50%; width:30px; height:30px; line-height:30px; text-align:center;">&times;</span>
                <img id="lightboxImage" style="max-width:100%; max-height:80vh; display:block; margin:0 auto;" src="" alt="Enlarged Product Image">
                <p id="lightboxCaption" style="color:#333; text-align:center; margin-top:10px; font-weight:bold;"></p>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', lightboxHTML);
    const lightboxOverlay = $('#lightboxOverlay');
    const lightboxImage = $('#lightboxImage');
    const lightboxCaption = $('#lightboxCaption');
    const lightboxClose = $('#lightboxClose');

    // Function to attach listeners to ALL images with class .product-card-img
    const attachLightboxListeners = () => {
        const productImages = $('.product-card-img', true);
        productImages.forEach(img => {
            img.removeEventListener('click', openLightbox); // Prevent duplicate listeners
            img.addEventListener('click', openLightbox);
        });
    };

    const openLightbox = function() {
        lightboxImage.src = this.src;
        lightboxCaption.textContent = this.dataset.productName || this.alt; 
        lightboxOverlay.style.display = 'flex';
    };

    if (lightboxClose) {
        lightboxClose.addEventListener('click', () => lightboxOverlay.style.display = 'none');
    }
    if (lightboxOverlay) {
        lightboxOverlay.addEventListener('click', (e) => {
            if (e.target.id === 'lightboxOverlay') {
                lightboxOverlay.style.display = 'none';
            }
        });
    }

    // Attach listeners to static products on initial load
    attachLightboxListeners();


    /* =========================
      6) SCROLL ANIMATIONS (For index.html)
      ========================= */

    const animateElements = $('.animate-on-scroll', true);

    const checkInView = () => {
        const viewportHeight = window.innerHeight;
        animateElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            // Show element if its top is less than 80% of the viewport height
            if (rect.top <= viewportHeight * 0.8) {
                el.classList.add('in-view');
            }
        });
    };

    // Run on load and on scroll
    window.addEventListener('scroll', checkInView);
    window.addEventListener('load', checkInView); // Initial check on load


    /* =========================
      7) LEAFLET MAP (For contact-us.html)
      ========================= */
    
    // Initialises the map. Must be placed in window scope if used with tabs
    window.initMap = function() {
        const mapElement = $('#sk-map');
        if (typeof L === 'undefined' || !mapElement) return;

        // Coordinates for 10 Weaver Way, Zeekoevlei, Cape Town, 7941 (Approximate)
        const zeekoevleiCoords = [-34.053, 18.528];
        
        // Check if map is already initialized to prevent errors inside tabs
        if (mapElement.hasAttribute('_leaflet_id')) {
            window.mapInstance.setView(zeekoevleiCoords, 14);
            window.mapInstance.invalidateSize();
            return;
        }

        const map = L.map('sk-map').setView(zeekoevleiCoords, 14);
        window.mapInstance = map; // Store instance globally for tab logic

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        L.marker(zeekoevleiCoords).addTo(map)
            .bindPopup('SK_Lasercuts, 10 Weaver Way, Zeekoevlei, Cape Town').openPopup();
    };

    // Run map initialization if the map container exists
    if ($('#sk-map')) {
        window.initMap();
    }


    /* =========================
      8) FORM VALIDATION / SUBMISSION (To naeem.meyer1@gmail.com)
      ========================= */

    const forms = $('form', true);
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Basic validation check (using required HTML attributes primarily)
            let isValid = true;
            const requiredFields = form.querySelectorAll('[required]');

            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.style.border = '2px solid darkred';
                } else {
                    field.style.border = '1px solid #ccc';
                }
            });

            if (!isValid) {
                // Use a simple console error instead of alert()
                console.error("Please fill in all required fields.");
                return; 
            }

            // Determine form type and construct mailto link
            let subject = 'General Enquiry from SK_Lasercuts Website';
            let body = '';
            
            const name = form.querySelector('#name')?.value || 'N/A';
            const email = form.querySelector('#email')?.value || 'N/A';
            const message = form.querySelector('#message')?.value || 'N/A';
            const product = form.querySelector('#product')?.value;

            if (product) { // Product Enquiry Form
                subject = `Product Enquiry: ${product} (${name})`;
                body = `
                    Name: ${name}
                    Email: ${email}
                    Product of Interest: ${product}
                    ---
                    Message: 
                    ${message}
                `.trim();
            } else { // Contact Form
                subject = `Website Contact Message from ${name}`;
                body = `
                    Name: ${name}
                    Email: ${email}
                    ---
                    Message: 
                    ${message}
                `.trim();
            }

            // Encode and trigger mailto
            const encodedSubject = encodeURIComponent(subject);
            const encodedBody = encodeURIComponent(body);

            // Use a console log to confirm attempt instead of alert()
            console.log(`Attempting to send email to naeem.meyer1@gmail.com...`);
            console.log(`Subject: ${subject}`);

            window.location.href = `mailto:naeem.meyer1@gmail.com?subject=${encodedSubject}&body=${encodedBody}`;
        });
    });
});


