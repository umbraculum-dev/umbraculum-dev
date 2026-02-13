export const metadata = {
  title: "About",
};

export default function AboutPage() {
  return (
    <>
      <h1 style={{ marginBottom: 8 }}>About</h1>
      <p className="muted" style={{ marginTop: 0 }}>
        Brewery App is an internal tool for recipe development and brew-day logging, with a water chemistry
        calculator inspired by BrunWater.
      </p>
    </>
  );
}

