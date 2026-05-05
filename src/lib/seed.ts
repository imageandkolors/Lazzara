import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';

const categories = [
  { name: 'Le Pizze', order: 1, slug: 'pizza', description: 'Classic Neapolitan pizza dough, 48-hour fermentation.' },
  { name: 'Antipasti', order: 0, slug: 'antipasti', description: 'Starters to awaken your palate.' },
  { name: 'Primi Piatti', order: 2, slug: 'pasta', description: 'Handmade pasta and traditional sauces.' },
  { name: 'Dolci', order: 3, slug: 'desserts', description: 'Sweet endings to your meal.' }
];

const menuItems = [
  // Pizza
  { categorySlug: 'pizza', name: 'Margherita DOP', description: 'Pomodoro San Marzano dell\'agro sarnese nocerino DOP, mozzarella di bufala campana DOP, basilico fresco, olio extra vergine d\'oliva.', price: 12, isVegetarian: true, popular: true, imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbad80ad38?q=80&w=2070&auto=format&fit=crop' },
  { categorySlug: 'pizza', name: 'Zia Esterina (Pizza Fritta)', description: 'La classica pizza fritta napoletana ripiena di ricotta, provola, cicoli di maiale e pepe.', price: 10, popular: true, imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=2070&auto=format&fit=crop' },
  { categorySlug: 'pizza', name: 'Marinara del Piennolo', description: 'Pomodorini del Piennolo del Vesuvio DOP, aglio, origano selvatico e olio EVO.', price: 9, isVegan: true, imageUrl: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?q=80&w=1925&auto=format&fit=crop' },
  
  // Antipasti
  { categorySlug: 'antipasti', name: 'Parmigiana di Melanzane', description: 'Melanzane fritte, fiordilatte, parmigiano reggiano e basilico. La ricetta originale napoletana.', price: 12, isVegetarian: true, popular: true, imageUrl: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?q=80&w=1974&auto=format&fit=crop' },
  { categorySlug: 'antipasti', name: 'Cuoppo Napoletano', description: 'Misto di fritti: zeppoline, panzarotti, arancini e verdure in pastella.', price: 10, imageUrl: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=2070&auto=format&fit=crop' },
  
  // Pasta (Primi)
  { categorySlug: 'pasta', name: 'Ziti alla Genovese', description: 'Cottura lenta di 12 ore di cipolle ramate di Montoro e carne di manzo, un classico intramontabile.', price: 15, popular: true, imageUrl: 'https://images.unsplash.com/photo-1473093226795-af9932fe5855?q=80&w=1994&auto=format&fit=crop' },
  { categorySlug: 'pasta', name: 'Paccheri allo Scoglio', description: 'Paccheri di Gragnano con frutti di mare freschi del porto di Napoli, aglio e prezzemolo.', price: 18, imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?q=80&w=2010&auto=format&fit=crop' },
  
  // Desserts
  { categorySlug: 'desserts', name: 'Rum Babà Tradizionale', description: 'Il classico babà napoletano a forma di fungo, bagnato nel rum agricolo.', price: 7, isVegetarian: true, popular: true, imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=2157&auto=format&fit=crop' },
  { categorySlug: 'desserts', name: 'Delizia al Limone', description: 'Soffice pan di spagna bagnato al limoncello di Sorrento con crema pasticcera al limone.', price: 8, isVegetarian: true, imageUrl: 'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?q=80&w=1974&auto=format&fit=crop' }
];

export const seedDatabase = async () => {
  try {
    const catSnap = await getDocs(collection(db, 'categories'));
    if (!catSnap.empty) {
      console.log('Database already seeded');
      return;
    }

    console.log('Seeding categories...');
    const slugToId: Record<string, string> = {};
    for (const cat of categories) {
      const docRef = await addDoc(collection(db, 'categories'), cat);
      slugToId[cat.slug] = docRef.id;
    }

    console.log('Seeding menu items...');
    for (const item of menuItems) {
      const { categorySlug, ...itemData } = item;
      await addDoc(collection(db, 'menuItems'), {
        ...itemData,
        categoryId: slugToId[categorySlug]
      });
    }

    console.log('Seeding complete!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};
