# Principes d'Architecture UI pour DevIndé Tracker

## Introduction

Ce document établit les principes directeurs pour l'architecture des composants UI dans DevIndé Tracker. Ces principes sont conçus pour être applicables indépendamment des futures refontes, servant de fondation pour une architecture UI robuste et évolutive.

## Principes SOLID adaptés aux composants React

### 1. Responsabilité Unique (Single Responsibility)

**Principe**: Un composant React ne devrait avoir qu'une seule raison de changer.

**Application**:
- Séparer les composants en trois catégories principales:
  - **Composants de présentation** (UI pure, pas d'état)
  - **Composants conteneurs** (gestion d'état, coordination)
  - **Composants de page** (routage, composition)
- Éviter les composants qui mélangent la logique métier, la gestion d'état et le rendu

**Exemple**:
```tsx
// Mauvaise pratique: mélange présentation et logique métier
const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchUser().then(data => {
      setUser(data);
      setLoading(false);
    });
  }, []);
  
  // Trop de responsabilités (chargement, affichage, formatage...)
  return (...)
}

// Bonne pratique: séparation en composants spécialisés
const UserProfileView = ({ user, onEdit }) => {
  // Uniquement responsable du rendu
  return (...)
}

const UserProfileContainer = () => {
  // Responsable de la coordination et l'état
  const { user, loading, error } = useUser();
  
  return (
    <LoadingWrapper loading={loading} error={error}>
      <UserProfileView user={user} onEdit={handleEdit} />
    </LoadingWrapper>
  );
}
```

### 2. Ouvert/Fermé (Open/Closed)

**Principe**: Les composants devraient être ouverts à l'extension mais fermés à la modification.

**Application**:
- Utiliser les props et le pattern de composition pour étendre les fonctionnalités
- Créer des composants de base génériques qui peuvent être étendus
- Utiliser des Higher-Order Components (HOC) ou des Hooks personnalisés pour enrichir les fonctionnalités

**Exemple**:
```tsx
// Composant de base fermé à la modification
const Button = ({ children, onClick, variant = 'primary', ...props }) => (
  <button 
    className={`btn btn-${variant}`} 
    onClick={onClick}
    {...props}
  >
    {children}
  </button>
);

// Extension sans modification via la composition
const SubmitButton = (props) => (
  <Button variant="success" type="submit" {...props}>
    <Icon name="check" /> {props.children || 'Submit'}
  </Button>
);
```

### 3. Substitution de Liskov (Liskov Substitution)

**Principe**: Les composants enfants devraient être substituables à leurs composants parents sans affecter le comportement du programme.

**Application**:
- Maintenir une interface cohérente pour les composants d'une même famille
- Assurer que les composants spécialisés respectent le contrat de leurs composants de base
- Éviter de modifier le comportement attendu dans les composants dérivés

**Exemple**:
```tsx
// Interface commune pour tous les composants d'entrée
interface InputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  disabled?: boolean;
}

// Composant de base
const TextInput = ({ value, onChange, label, error, disabled }: InputProps) => {
  // Implémentation...
};

// Composant dérivé qui respecte le contrat
const EmailInput = (props: InputProps) => (
  <TextInput 
    {...props}
    type="email"
    validator={validateEmail}
  />
);

// Ces composants peuvent être utilisés de manière interchangeable
<FormField>
  {isEmailField ? <EmailInput {...inputProps} /> : <TextInput {...inputProps} />}
</FormField>
```

### 4. Ségrégation d'Interface (Interface Segregation)

**Principe**: Les clients ne devraient pas dépendre d'interfaces dont ils n'ont pas besoin.

**Application**:
- Concevoir des props minimalistes et spécifiques
- Utiliser le destructuring pour n'extraire que les props nécessaires
- Diviser les grands composants en plus petits avec des interfaces plus spécifiques

**Exemple**:
```tsx
// Mauvaise pratique: interface trop large
interface MegaComponentProps {
  user: User;
  products: Product[];
  cart: Cart;
  orders: Order[];
  onAddToCart: (product: Product) => void;
  onCheckout: () => void;
  onUserUpdate: (user: User) => void;
  // ...beaucoup d'autres props
}

// Bonne pratique: interfaces ségrégées
interface UserProfileProps {
  user: User;
  onUserUpdate: (user: User) => void;
}

interface ProductListProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

interface CartSummaryProps {
  cart: Cart;
  onCheckout: () => void;
}

// Composants avec interfaces spécifiques
const Dashboard = () => (
  <div>
    <UserProfile user={user} onUserUpdate={handleUserUpdate} />
    <ProductList products={products} onAddToCart={handleAddToCart} />
    <CartSummary cart={cart} onCheckout={handleCheckout} />
  </div>
);
```

### 5. Inversion de Dépendance (Dependency Inversion)

**Principe**: Les modules de haut niveau ne devraient pas dépendre des modules de bas niveau. Les deux devraient dépendre d'abstractions.

**Application**:
- Utiliser des hooks personnalisés pour abstraire les services et l'accès aux données
- Injecter les dépendances via les props ou le contexte plutôt que d'importer directement
- Créer des adaptateurs pour les services externes

**Exemple**:
```tsx
// Mauvaise pratique: dépendance directe au service
const UserList = () => {
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    // Dépendance directe
    userService.getUsers().then(setUsers);
  }, []);
  
  return (/* rendu */);
};

// Bonne pratique: dépendance inversée via un hook
const useUsers = () => {
  // Hook qui abstrait l'accès au service
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    setLoading(true);
    userService.getUsers()
      .then(data => {
        setUsers(data);
        setError(null);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);
  
  return { users, loading, error };
};

// Le composant dépend de l'abstraction, pas de l'implémentation
const UserList = () => {
  const { users, loading, error } = useUsers();
  
  if (loading) return <Loading />;
  if (error) return <Error message={error.message} />;
  
  return (/* rendu */);
};
```

## Patterns architecturaux à privilégier

### 1. Pattern de Présentation/Conteneur (Smart/Dumb Components)

- **Composants de présentation** (Dumb): Centrés sur l'apparence, reçoivent des données via props
- **Composants conteneurs** (Smart): Gèrent l'état, la logique, et les effets secondaires

### 2. Pattern de Composition

- Favoriser la composition plutôt que l'héritage
- Utiliser des enfants (`children`) et la composition de composants
- Créer des composants hautement réutilisables et combinables

### 3. Hooks personnalisés pour la logique partagée

- Extraire la logique réutilisable dans des hooks personnalisés
- Séparer les préoccupations (données, événements, effets secondaires)
- Assurer que les hooks respectent les règles React (ex: exhaustivité des dépendances)

### 4. Context API pour l'état global

- Utiliser Context pour les données qui doivent être accessibles à plusieurs composants
- Segmenter les contextes par domaine pour éviter les re-rendus inutiles
- Combiner avec useReducer pour une gestion d'état plus prévisible

## Flux de données

### Principes de flux de données unidirectionnel

1. **État descendant** - L'état circule du parent vers l'enfant
2. **Événements ascendants** - Les actions remontent des enfants vers les parents
3. **Source de vérité unique** - Une seule source faisant autorité pour chaque information

### Règles de gestion d'état

1. **État local d'abord** - Préférer useState pour l'état spécifique à un composant
2. **État de context** - Utiliser Context pour l'état partagé entre composants proches
3. **État global** - Réserver l'état global pour les données véritablement globales

## Standardisation des interfaces de composants

### Conventions de nommage

```typescript
// Interface de props pour les composants
interface ButtonProps {
  // Props communes à tous les boutons
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  onClick?: (event: React.MouseEvent) => void;
  children: React.ReactNode;
}

// Extension pour un type spécifique de bouton
interface SubmitButtonProps extends ButtonProps {
  isSubmitting?: boolean;
  form?: string;
}
```

### Props standards

Pour tous les composants interactifs:
- `disabled?: boolean` - État désactivé
- `loading?: boolean` - État de chargement
- `error?: string | Error` - Message d'erreur
- `aria-*` props - Accessibilité
- `data-testid` - Pour les tests
- `className` - Pour styles personnalisés

## Documentation des composants

### Format JSDoc

```tsx
/**
 * Composant affichant un élément d'action plan avec des contrôles interactifs.
 * 
 * @param {Object} props - Les propriétés du composant
 * @param {ActionPlanItem} props.item - L'élément d'action plan à afficher
 * @param {(id: string) => void} props.onSelect - Callback lorsque l'élément est sélectionné
 * @param {(id: string, changes: Partial<ActionPlanItem>) => void} props.onChange - Callback lors de modifications
 * @param {boolean} [props.isEditing=false] - Si l'élément est en mode édition
 * 
 * @example
 * <ActionPlanItem 
 *   item={myItem} 
 *   onSelect={handleSelect} 
 *   onChange={handleChange}
 *   isEditing={editMode}
 * />
 */
export const ActionPlanItem = ({ 
  item, 
  onSelect, 
  onChange, 
  isEditing = false 
}: ActionPlanItemProps) => {
  // Implémentation...
};
```

## Tests de composants

### Stratégie de test

1. **Tests unitaires** - Tester les composants de présentation isolément
2. **Tests d'intégration** - Tester les conteneurs avec leurs enfants
3. **Tests de pages** - Tester les pages entières avec leurs contextes

### Exemples de bonnes pratiques

```tsx
// Test d'un composant de présentation
it('renders correctly with props', () => {
  render(<Button variant="primary">Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
  expect(screen.getByRole('button')).toHaveClass('btn-primary');
});

// Test d'interaction
it('calls onClick handler when clicked', () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick}>Click me</Button>);
  userEvent.click(screen.getByText('Click me'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

## Gestion des formulaires

### Pattern recommandé

```tsx
// Hook personnalisé pour la gestion de formulaire
const useForm = <T extends Record<string, any>>(initialValues: T) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  // Autres méthodes (reset, validate, etc.)

  return { values, errors, touched, handleChange, handleBlur /* ... */ };
};

// Utilisation
const ProfileForm = () => {
  const { values, errors, touched, handleChange, handleBlur, handleSubmit } = 
    useForm({ name: '', email: '' });

  return (
    <form onSubmit={handleSubmit}>
      <Input
        name="name"
        value={values.name}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.name && errors.name}
      />
      {/* Autres champs */}
    </form>
  );
};
```

## Conclusion

Ces principes visent à établir une base solide pour l'architecture UI, indépendamment des futures refontes. Ils favorisent une séparation claire des responsabilités, une maintenance simplifiée et une évolution progressive de l'interface utilisateur.

En suivant ces lignes directrices, l'équipe pourra:

1. Développer des composants modulaires et réutilisables
2. Faciliter les tests et le débogage
3. Améliorer la collaboration entre développeurs
4. Préparer le terrain pour une évolution future sans rupture majeure

Cette approche équilibrée permet d'investir stratégiquement dans l'architecture UI tout en restant alignée sur les objectifs business et l'évolution prévue de l'application.