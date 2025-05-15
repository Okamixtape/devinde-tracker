# Composants UI DevIndé Tracker

Ce document définit les composants UI réutilisables qui forment la base du système de design de DevIndé Tracker.

## Boutons

### Variantes principales
- **Primary** : Fond bleu (#4299e1), texte blanc, arrondi moyen
- **Secondary** : Contour bleu, texte bleu, transparent
- **Tertiary** : Sans bordure, texte bleu, transparent
- **Danger** : Fond rouge (#f56565), texte blanc

### Tailles
- **Small** : Padding 0.5rem 1rem, texte 0.875rem
- **Medium** (défaut) : Padding 0.75rem 1.5rem, texte 1rem
- **Large** : Padding 1rem 2rem, texte 1.125rem

### États
- **Default** : Opacité 100%
- **Hover** : Légèrement plus foncé, transition douce
- **Active** : Plus foncé, léger effet d'enfoncement
- **Disabled** : Opacité 50%, curseur non-autorisé
- **Loading** : Indicateur de chargement, désactivé

## Cartes

### Card
Conteneur avec ombre légère, coins arrondis et padding interne.

```jsx
<Card>
  <CardHeader>Titre de la carte</CardHeader>
  <CardContent>Contenu principal</CardContent>
  <CardFooter>Actions supplémentaires</CardFooter>
</Card>
```

### Variantes
- **Standard** : Fond blanc, ombre légère
- **Elevated** : Ombre plus prononcée
- **Outlined** : Bordure fine sans ombre
- **Interactive** : Effet hover, pointer cursor

## Formulaires

### Input
Champ de saisie avec label et support de validation.

```jsx
<FormField>
  <Label>Nom du champ</Label>
  <Input placeholder="Saisir..." />
  <HelperText>Information additionnelle</HelperText>
  <ErrorMessage>Message d'erreur</ErrorMessage>
</FormField>
```

### Variations d'Input
- **Text** : Saisie standard
- **Number** : Valeurs numériques
- **Password** : Masqué avec toggle
- **Textarea** : Multi-lignes
- **Select** : Options déroulantes
- **Checkbox/Radio** : Sélection binaire/exclusive

## Navigation

### Tabs
Navigation par onglets pour alterner entre contenus liés.

```jsx
<Tabs defaultTab="overview">
  <TabList>
    <Tab id="overview">Vue d'ensemble</Tab>
    <Tab id="details">Détails</Tab>
    <Tab id="settings">Paramètres</Tab>
  </TabList>
  <TabPanels>
    <TabPanel id="overview">Contenu vue d'ensemble</TabPanel>
    <TabPanel id="details">Contenu détails</TabPanel>
    <TabPanel id="settings">Contenu paramètres</TabPanel>
  </TabPanels>
</Tabs>
```

### Dropdown/Menu
Menu déroulant pour options ou actions contextuelles.

```jsx
<Dropdown>
  <DropdownTrigger>
    <Button>Actions</Button>
  </DropdownTrigger>
  <DropdownMenu>
    <DropdownItem>Editer</DropdownItem>
    <DropdownItem>Dupliquer</DropdownItem>
    <DropdownDivider />
    <DropdownItem variant="danger">Supprimer</DropdownItem>
  </DropdownMenu>
</Dropdown>
```

## Feedback utilisateur

### Alert
Notifications et messages informatifs.

```jsx
<Alert variant="info|success|warning|error">
  <AlertIcon />
  <AlertTitle>Titre de l'alerte</AlertTitle>
  <AlertDescription>Description détaillée de l'alerte avec plus d'informations.</AlertDescription>
  <AlertActions>
    <Button size="small">Action</Button>
  </AlertActions>
</Alert>
```

### Toast
Notifications brèves et non-intrusives.

```jsx
// Utilisation via hook
const { showToast } = useToast();
showToast({
  title: "Opération réussie",
  description: "Votre action a été traitée avec succès",
  variant: "success", // success, error, warning, info
  duration: 3000
});
```

### Progress
Indicateurs de progression.

```jsx
// Barre de progression
<ProgressBar value={65} max={100} />

// Indicateur circulaire
<ProgressCircle value={65} max={100} />

// Step indicator
<Steps currentStep={2} totalSteps={4}>
  <Step title="Étape 1" />
  <Step title="Étape 2" />
  <Step title="Étape 3" />
  <Step title="Étape 4" />
</Steps>
```

## Visualisation des données

### Badge
Petits indicateurs d'état ou de catégorie.

```jsx
<Badge variant="success">Terminé</Badge>
<Badge variant="warning">En cours</Badge>
<Badge variant="danger">Problème</Badge>
<Badge variant="info">Nouveau</Badge>
```

### Table
Affichage de données tabulaires.

```jsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHeaderCell>Nom</TableHeaderCell>
      <TableHeaderCell>Statut</TableHeaderCell>
      <TableHeaderCell>Actions</TableHeaderCell>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Projet A</TableCell>
      <TableCell><Badge variant="success">Terminé</Badge></TableCell>
      <TableCell>
        <ButtonGroup>
          <Button size="small">Voir</Button>
          <Button size="small" variant="secondary">Éditer</Button>
        </ButtonGroup>
      </TableCell>
    </TableRow>
    <!-- Autres lignes -->
  </TableBody>
</Table>
```

### Graphiques
Composants basés sur Recharts pour visualiser les données.

```jsx
// Graphique en barres
<BarChart data={revenueData} />

// Graphique linéaire
<LineChart data={trendData} />

// Graphique camembert
<PieChart data={distributionData} />
```

## Layout

### Container
Conteneur principal avec largeur maximale et centrage.

```jsx
<Container size="sm|md|lg|xl|full">
  Contenu centré avec largeur limitée
</Container>
```

### Grid
Système de grille flexible basé sur CSS Grid.

```jsx
<Grid columns="1|2|3|4|6|12" gap="sm|md|lg">
  <GridItem colSpan="1|2|3|..." rowSpan="1|2|...">
    Contenu
  </GridItem>
  <!-- Autres items -->
</Grid>
```

### Flex
Layout flexible basé sur Flexbox.

```jsx
<Flex direction="row|column" align="center|start|end" justify="between|center|start|end">
  <FlexItem grow shrink basis="auto|0|100%">
    Contenu
  </FlexItem>
  <!-- Autres items -->
</Flex>
```
