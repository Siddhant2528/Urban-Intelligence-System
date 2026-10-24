export default function Placeholder({ title, owner, todo }: { title: string; owner: "Dev A" | "Dev B"; todo: string[] }) {
  return (
    <section>
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-1 text-sm text-slate-500">Owner: {owner}</p>
      <ul className="mt-4 list-disc space-y-1 pl-5 text-sm">{todo.map((t) => <li key={t}>{t}</li>)}</ul>
    </section>
  );
}
