# Project

## Description

I'm happy to introduce you a light version of the project which was developed as part of the EPAM 2025 Frontend Learning Program.

General Features of this project:

- The task was not to use any Frameworks or libraries like React, NextJS and bundlers like Gulp, WebPack etc so the project was built entirely with vanilla JavaScript.
- Fully responsive for tablet and mobile devices;
- All HTML, SCSS, and JavaScript code is modular and well-structured. In the original project - the header and footer are loaded dynamically, simplifying maintenance and enabling easy addition of new pages;
- Products data is loaded dynamically from a JSON file, emulating real database requests;

JavaScript Functionality:

- The header is sticky, and the navigation collapses into a toggle menu on mobile;
- The shopping cart icon updates the product counter in real time, synchronized with localStorage;
- Product pages load dynamically: clicking a product passes its ID through the URL and fetches the corresponding data from JSON;
- All form fields feature real-time validation using regular expressions;
- The Catalog page includes filtering, sorting, search, and pagination — all fully functional, its not just a static layout :) ;
- The Shopping Cart page is fully dynamic, cart totals are updating immediately based on user actions;
- Created custom carousel functionality as per project requirements;
- Implemented custom product list pagination functionality to support large inventories;


CSS / SCSS Features:

- Built with SASS, using global variables, mixins, placeholders, and other reusable components for easy scalability;
- Custom UI elements: quantity inputs, password fields, checkboxes, and rating selectors.;
- Layouts implemented with Flexbox and CSS Grid to build clean multi-column structures;
