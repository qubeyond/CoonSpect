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
      className="py-24 bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] text-center"
    >
      <Heading level={2} className="text-[var(--color-text-purple)] mb-8 text-3xl font-bold">
        Примеры конспектов
      </Heading>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto px-6">
        {examples.map((ex, i) => (
          <div
            key={i}
            className="bg-[var(--color-bg-accent)] p-8 rounded-2xl hover:border-[var(--color-purple-500)]/40 transition transform hover:-translate-y-1"
          >
            <Text size="lg" className="text-[var(--color-text-primary)] font-semibold mb-2">
              {ex.title}
            </Text>
            <Text size="sm" className="text-[var(--color-text-secondary)]">
              {ex.desc}
            </Text>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ExamplesSection;
