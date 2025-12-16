import Text from "../atoms/Text";

const Footer: React.FC = () => (
  <footer className="border-t border-[var(--color-border)] py-6 bg-[var(--color-bg-primary)] text-center">
    <Text size="sm" className="text-[var(--color-text-secondary)]">
      © {new Date().getFullYear()} CoonSpect — все права защищены.
    </Text>
  </footer>
);

export default Footer;
