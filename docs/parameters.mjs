import { writeFileSync } from "node:fs";
import ts from "typescript";

const { config, error } = ts.readConfigFile("tsconfig.json", ts.sys.readFile);
if (error)
  throw new Error(ts.flattenDiagnosticMessageText(error.messageText, "\n"));
const { options } = ts.parseJsonConfigFileContent(config, ts.sys, ".");
const entry = "src/ui/index.ts";
const program = ts.createProgram([entry], options);
const checker = program.getTypeChecker();
const source = program.getSourceFile(entry);
const root = source && checker.getSymbolAtLocation(source);
if (!root) throw new Error("Tsumiki の公開 API を読み込めませんでした");

const textFieldAttributes = new Set([
  "size",
  "class",
  "id",
  "name",
  "value",
  "placeholder",
  "disabled",
  "required",
  "readonly",
  "type",
  "onInput",
  "onChange",
  "onKeyDown",
  "aria-label",
  "aria-labelledby",
  "aria-describedby",
  "aria-invalid",
]);
const catalog = {};
for (const item of checker.getExportsOfModule(root)) {
  const name = item.getName();
  if (!/^[A-Z]/.test(name)) continue;
  const symbol =
    item.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(item) : item;
  const signature = checker
    .getTypeOfSymbolAtLocation(symbol, source)
    .getCallSignatures()[0];
  if (!signature) continue;
  const props = signature.getParameters()[0];
  const declaration = signature.getDeclaration() ?? source;
  catalog[name] = props
    ? checker
        .getPropertiesOfType(
          checker.getTypeOfSymbolAtLocation(props, declaration),
        )
        .filter(
          (prop) =>
            name !== "TextField" || textFieldAttributes.has(prop.getName()),
        )
        .map((prop) => ({
          name: prop.getName(),
          optional: Boolean(prop.flags & ts.SymbolFlags.Optional),
          type: checker.typeToString(
            checker.getTypeOfSymbolAtLocation(prop, declaration),
            declaration,
          ),
          description: ts.displayPartsToString(
            prop.getDocumentationComment(checker),
          ),
        }))
    : [];
}
writeFileSync(
  "docs/parameters.generated.json",
  JSON.stringify(catalog, null, 2) + "\n",
);
