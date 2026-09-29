// Illustrative packaging, not a photograph of any specific manufacturer's product.
const palettes = {
  'Pain relief': ['#eaf4f0', '#0f6b5c'],
  Antibiotics: ['#eaf2f7', '#2e6c94'],
  Vitamins: ['#fff3e2', '#bc7728'],
  Diabetes: ['#edeef9', '#6366a5'],
  Allergy: ['#f6eafa', '#965b9b'],
};

export default function MedicineIllustration({ name, category }) {
  const [background, accent] = palettes[category] || palettes['Pain relief'];
  const capsule = category === 'Antibiotics' || category === 'Allergy';
  const bottle = category === 'Vitamins';

  return (
    <div className="medicine-art" style={{ '--art-bg': background, '--art-accent': accent }} role="img" aria-label={`Illustration for ${name}; appearance may differ from the actual product`}>
      <span className="medicine-art-glow" />
      <span className={`medicine-art-pack ${bottle ? 'is-bottle' : ''}`}>
        <span className="medicine-art-symbol">+</span>
        <span className="medicine-art-pack-name">{name}</span>
        <span className="medicine-art-pack-lines" />
      </span>
      <span className={`medicine-art-dose ${capsule ? 'is-capsule' : ''}`}>
        <span />
      </span>
      <span className="medicine-art-dot" />
    </div>
  );
}
