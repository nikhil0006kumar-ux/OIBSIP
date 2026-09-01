const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const navItems = document.querySelectorAll(".nav-link");

const backToTop = document.querySelector(".back-to-top");

const revealElements = document.querySelectorAll(".reveal");

const sections = document.querySelectorAll("main section[id]");

const currentYear = document.getElementById("currentYear");

menuToggle.addEventListener("click", () => {

    const isOpen = navLinks.classList.toggle("open");

    menuToggle.classList.toggle("active", isOpen);

    menuToggle.setAttribute(
        "aria-expanded",
        isOpen.toString()
    );

});

navItems.forEach((item) => {

    item.addEventListener("click", () => {

        navLinks.classList.remove("open");

        menuToggle.classList.remove("active");

        menuToggle.setAttribute(
            "aria-expanded",
            "false"
        );

    });

});

const revealObserver = new IntersectionObserver(
    (entries, observer) => {

        entries.forEach((entry) => {

            if (entry.isIntersecting) {

                entry.target.classList.add("visible");

                observer.unobserve(entry.target);

            }

        });

    },
    {
        threshold: 0.12
    }
);

revealElements.forEach((element) => {

    revealObserver.observe(element);

});

window.addEventListener("scroll", () => {

    if (window.scrollY > 600) {

        backToTop.classList.add("show");

    } else {

        backToTop.classList.remove("show");

    }

});

backToTop.addEventListener("click", () => {

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

});

const sectionObserver = new IntersectionObserver(
    (entries) => {

        entries.forEach((entry) => {

            if (entry.isIntersecting) {

                const currentId = entry.target.getAttribute("id");

                navItems.forEach((link) => {

                    link.classList.remove("active");

                    const target = link.getAttribute("href");

                    if (target === `#${currentId}`) {

                        link.classList.add("active");

                    }

                });

            }

        });

    },
    {
        rootMargin: "-25% 0px -60% 0px"
    }
);

sections.forEach((section) => {

    sectionObserver.observe(section);

});

if (currentYear) {

    currentYear.textContent = new Date().getFullYear();

}