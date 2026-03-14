const { createApp } = Vue;

createApp({
  data() {
    return {
      titel: "Academisch Ziekenhuis Paramaribo (AZP)",
      beschrijving: "Met Medixflow kunt u snel en veilig een afspraak maken bij verschillende afdelingen van het AZP.",
      
      isScrolled: false,
      currentPage: window.location.pathname.split("/").pop() || 'index.html',

      zoekTermAfdelingen: '',
      zoekTermArtsen: '',

      afdelingen: [
        { id: 1, naam: 'Kaakchirurgie', img: 'img/Kaakchirurgie - Afdelingen.jpg', tekst: 'Behandeling van aandoeningen aan de kaak, mond en het aangezicht.' },
        { id: 2, naam: 'Kindergeneeskunde', img: 'img/Kindergeneeskunde - Afdelingen.jpg', tekst: 'Medische zorg voor baby’s, kinderen en jongeren.' },
        { id: 3, naam: 'Gynaecologie', img: 'img/Gynaecologie - Afdelingen.jpg', tekst: 'Zorg voor de gezondheid van vrouwen en zwangerschapszorg.' },
        { id: 4, naam: 'Radiologie', img: 'img/Radiologie - Afdelingen.jpg', tekst: 'Diagnostische onderzoeken zoals röntgenfoto’s en MRI-scans.' },
        { id: 5, naam: 'Interne Geneeskunde', img: 'img/Interne Geneeskunde - Afdelingen.jpg', tekst: 'Diagnose en behandeling van inwendige ziekten.' },
        { id: 6, naam: 'Cardiologie', img: 'img/Cardiologie - Afdelingen.jpg', tekst: 'Diagnose en behandeling van hart- en vaatziekten.' },
        { id: 7, naam: 'Neurologie', img: 'img/Neurologie - Afdelingen.jpeg', tekst: 'Zorg voor aandoeningen van het zenuwstelsel.' },
        { id: 8, naam: 'Orthopedie', img: 'img/Orthopedie - Afdelingen.png', tekst: 'Behandeling van botten, gewrichten en spieren.' }
      ],

      artsen: [
        { id: 1, naam: 'Dr. H. Sital', specialisme: 'Orthopedisch Chirurg', afdeling: 'Orthopedie', img: 'https://placehold.co/150' },
        { id: 2, naam: 'Dr. R. Tjon', specialisme: 'Kinderarts', afdeling: 'Kindergeneeskunde', img: 'https://placehold.co/150' },
        { id: 3, naam: 'Dr. A. Soekhlal', specialisme: 'Cardioloog', afdeling: 'Cardiologie', img: 'https://placehold.co/150' },
        { id: 4, naam: 'Drs. F. Alexander', specialisme: 'Kaakchirurg', afdeling: 'Kaakchirurgie', img: 'https://placehold.co/150' },
        { id: 5, naam: 'Dr. L. Ramdin', specialisme: 'Gynaecoloog', afdeling: 'Gynaecologie', img: 'https://placehold.co/150' },
        { id: 6, naam: 'Drs. R. Velazquez', specialisme: 'Kaakchirurg', afdeling: 'Kaakchirurgie', img: 'https://placehold.co/150', hidden: true }
      ],

      contactData: {
        voornaam: '',
        achternaam: '',
        email: '',
        telefoon: '',
        bericht: ''
        },
        verzendStatus: 'rust'
    }
  },

  computed: {
    gefilterdeAfdelingen() {
      return this.afdelingen.filter(afd => {
        return afd.naam.toLowerCase().includes(this.zoekTermAfdelingen.toLowerCase());
      });
    },
    gefilterdeArtsen() {
        const zoek = this.zoekTermArtsen.toLowerCase().trim();

        if (zoek === "") {
            return this.artsen.filter(arts => !arts.hidden);
        }

        return this.artsen.filter(arts => {
            return arts.naam.toLowerCase().includes(zoek) || 
                   arts.afdeling.toLowerCase().includes(zoek) ||
                   arts.specialisme.toLowerCase().includes(zoek);
        });
    }
},

  methods: {
    handleScroll() {
      this.isScrolled = window.scrollY > 50;
    },
    scrollToFeatures() {
      const section = document.querySelector('.highlights-section');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    },
    submitContactForm() {
      this.verzendStatus = 'verzenden';
      console.log("Bericht verzonden door:", this.contactData.voornaam);
      
      setTimeout(() => {
        this.verzendStatus = 'verzonden';
        setTimeout(() => {
          this.contactData = { voornaam: '', achternaam: '', email: '', telefoon: '', bericht: '' };
          this.verzendStatus = 'rust';
        }, 3000);
      }, 1000);
    }
  },

  mounted() {
    window.addEventListener('scroll', this.handleScroll);
    console.log("Medixflow App geladen! 🏥");
    console.log("Huidige pagina:", this.currentPage);
  },
  
  unmounted() {
    window.removeEventListener('scroll', this.handleScroll);
  }
}).mount('#app');