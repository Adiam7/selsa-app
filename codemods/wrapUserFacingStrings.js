/**
 * Advanced codemod for wrapping user-facing strings with t() or <Trans>.
 * - Handles JSX text, common UI function calls, template literals, and edge cases.
 * - Skips technical/log strings and is idempotent.
 * - Designed for reviewability and CI integration.
 *
 * Limitations: Some context-specific cases may require manual review.
 */

const UI_FUNCTIONS = [
  'setMessage', 'alert', 'toast', 'notify', 'showError', 'showSuccess', 'showInfo', 'showWarning',
];

const isLikelyUserFacing = (str) => {
  // Heuristic: skip short, all-uppercase, or code-like strings
  if (!str || str.length < 2) return false;
  if (/^[A-Z0-9_\-]+$/.test(str.trim())) return false;
  if (/error|exception|code|id|token|debug|trace|stack|internal/i.test(str)) return false;
  return true;
};

module.exports = function transformer(fileInfo, api) {
  const j = api.jscodeshift;
  let didChange = false;
  const root = j(fileInfo.source);

  // 1. Wrap JSX text nodes
  root.find(j.JSXElement)
    .forEach(path => {
      path.node.children.forEach((child, idx) => {
        if (
          child.type === 'JSXText' &&
          isLikelyUserFacing(child.value) &&
          !child.value.includes('{t(') &&
          child.value.trim() !== ''
        ) {
          // Replace with {t('...')}
          const text = child.value.trim();
          path.node.children[idx] = j.jsxExpressionContainer(
            j.callExpression(j.identifier('t'), [j.literal(text)])
          );
          didChange = true;
        }
      });
    });

  // 2. Wrap string literals in UI function calls
  root.find(j.CallExpression)
    .forEach(path => {
      const callee = path.node.callee;
      if (
        (callee.type === 'Identifier' && UI_FUNCTIONS.includes(callee.name)) ||
        (callee.type === 'MemberExpression' && UI_FUNCTIONS.includes(callee.property.name))
      ) {
        path.node.arguments = path.node.arguments.map(arg => {
          if (
            arg.type === 'Literal' &&
            typeof arg.value === 'string' &&
            isLikelyUserFacing(arg.value) &&
            !(arg.value.startsWith('t(') || arg.value.startsWith('<Trans'))
          ) {
            didChange = true;
            return j.callExpression(j.identifier('t'), [j.literal(arg.value)]);
          }
          // Template literals
          if (
            arg.type === 'TemplateLiteral' &&
            arg.quasis.length === 1 &&
            isLikelyUserFacing(arg.quasis[0].value.cooked)
          ) {
            didChange = true;
            return j.callExpression(j.identifier('t'), [j.literal(arg.quasis[0].value.cooked)]);
          }
          return arg;
        });
      }
    });

  // 3. Idempotency: skip if already wrapped
  // (Handled by checks above)

  // 4. Optionally, handle attributes (e.g., placeholder, aria-label)
  root.find(j.JSXAttribute)
    .forEach(path => {
      const attr = path.node;
      if (
        ['placeholder', 'aria-label', 'title', 'alt', 'label'].includes(attr.name.name) &&
        attr.value &&
        attr.value.type === 'Literal' &&
        isLikelyUserFacing(attr.value.value) &&
        !(attr.value.value.startsWith('t(') || attr.value.value.startsWith('<Trans'))
      ) {
        attr.value = j.jsxExpressionContainer(
          j.callExpression(j.identifier('t'), [j.literal(attr.value.value)])
        );
        didChange = true;
      }
    });

  return didChange ? root.toSource({ quote: 'single' }) : null;
};
