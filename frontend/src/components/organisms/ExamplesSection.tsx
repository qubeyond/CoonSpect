import Heading from "../atoms/Heading";
import Text from "../atoms/Text";

const ExamplesSection: React.FC = () => {
  const examples = [
    {
      title: "Лекция по физике",
      desc: "Подробный пересказ формул и теорий из университетской лекции.",
    },
    {
      title: "Подкаст о маркетинге",
      desc: "Конспект с ключевыми идеями и советами для бизнеса.",
    },
    {
      title: "Интервью с учёным",
      desc: "Сжатое изложение смыслов и выводов из интервью.",
    },
  ];

  return (
    <section
      id="examples"
      className="py-24 color-bg-primary dark:color-bg-primary dark:bg-white text-center text-white dark:text-gray-900"
    >
      <Heading level={2} className="text-purpACle-400 dark:text-purple-600 mb-8 text-3xl font-bold">
        Примеры конспектов
      </Heading>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto px-6">
        {examples.map((ex, i) => (
          <div
            key={i}
            className="bg-[#16182D] dark:bg-white p-8 rounded-2xl border border-purple-800/20 dark:border-gray-200 hover:border-purple-500/40 transition transform hover:-translate-y-1"
          >
            <Text size="lg" className="text-white dark:text-gray-900 font-semibold mb-2">
              {ex.title}
            </Text>
            <Text size="sm" className="text-gray-400 dark:text-gray-600">
              {ex.desc}
            </Text>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ExamplesSection;
