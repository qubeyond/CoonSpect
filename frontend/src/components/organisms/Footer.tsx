import Text from "../atoms/Text";

const Footer: React.FC = () => (
  <footer className="border-t border-purple-800/30 dark:border-gray-200 py-6 bg-[#0B0C1C] dark:bg-white text-center">
    <Text size="sm" className="text-gray-500 dark:text-gray-600">
      © {new Date().getFullYear()} CoonSpect — все права защищены.
    </Text>
  </footer>
);

export default Footer;
