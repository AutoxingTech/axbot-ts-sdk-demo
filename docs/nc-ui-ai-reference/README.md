# AI Reference Documentation for nc-ui

This folder contains AI-friendly documentation for the `@kingsimba/nc-ui` component library. These files help AI assistants (GitHub Copilot, Claude Code, etc.) quickly understand and correctly use nc-ui components in your projects.

## Purpose

When using nc-ui in a new project, AI assistants might default to using native HTML elements like `<button>`, `<select>`, or `<input>`. This documentation helps them:

1. **Recognize** that nc-ui components should be used instead
2. **Understand** the API differences (e.g., `onChange` receives values, not events)
3. **Follow** nc-ui conventions (CSS prefix, import patterns, etc.)
4. **Avoid** common mistakes and anti-patterns

## How to Use

### For New Projects Using nc-ui

1. **Copy this entire `nc-ui-ai-reference/` folder** to your project's `docs/` directory:
   ```bash
   cp -r nc-ui/nc-ui-ai-reference /path/to/your-project/docs/nc-ui-ai-reference
   ```

2. **Set up AI-specific entry files:**

   #### For GitHub Copilot:
   ```bash
   mkdir -p .github
   cp docs/nc-ui-ai-reference/copilot-instructions.md .github/copilot-instructions.md
   ```

   #### For Claude Code:
   ```bash
   mkdir -p .claude
   cp docs/nc-ui-ai-reference/claude-context.md .claude/project-context.md
   ```

3. **Commit all files** so they're available to AIs:
   ```bash
   git add docs/nc-ui-ai-reference/ .github/ .claude/
   git commit -m "Add nc-ui AI reference documentation"
   ```

### Verification

After setup, your project structure should look like:

```
your-project/
├── docs/
│   └── nc-ui-ai-reference/
│       ├── README.md                        # This file
│       ├── architecture.md                  # Architecture & conventions
│       ├── components-quick-reference.md    # All components API
│       ├── global-utility-styles.md         # Global styles (h1, .tag, .block, etc.)
│       ├── examples-and-antipatterns.md     # Usage examples
│       ├── app-framework.md                 # App framework guide (optional)
│       ├── copilot-instructions.md          # Template for Copilot
│       └── claude-context.md                # Template for Claude
├── .github/
│   └── copilot-instructions.md          # → Copied from docs/nc-ui-ai-reference/
└── .claude/
    └── project-context.md               # → Copied from docs/nc-ui-ai-reference/
```

## File Descriptions

### Entry Files (Copy to Project)

**`copilot-instructions.md`**
Concise entry point for GitHub Copilot with critical rules and quick reference. Copy to `.github/copilot-instructions.md` in your project.

**`claude-context.md`**
Detailed entry point for Claude Code with architecture overview and common patterns. Copy to `.claude/project-context.md` in your project.

### Reference Documentation (Copy Entire Folder)

**`architecture.md`**
Comprehensive guide covering:
- CSS naming conventions (nc- prefix for components, no prefix for utilities)
- Component patterns
- Styling system
- App framework (optional)
- Project structure

**`components-quick-reference.md`**
Complete API reference for all 23+ components:
- Import patterns
- Props and usage examples
- Migration guide (HTML → nc-ui)
- TypeScript support

**`global-utility-styles.md`**
Global utility styles (WITHOUT `nc-` prefix):
- Typography (h1, h2, h3, h4)
- Text colors (p.weak, p.weaker)
- Code (code, .code-block)
- Tags (.tag, .tag.red, .tag.yellow, etc.)
- Blocks (.block, .block.note, .block.warning, .block.danger)
- Lists (ul, ol, ul.no-dots)

**`examples-and-antipatterns.md`**
Practical examples and common mistakes:
- ❌ Wrong patterns (using native HTML, wrong event handlers)
- ✅ Correct patterns (using nc-ui components)
- Complete real-world examples
- Best practices checklist

## Why This Approach?

### Portable and Reusable
- Copy once, use in multiple projects
- Same documentation for all AI tools
- Update nc-ui docs, copy to projects again

### Discoverable
- AIs can easily find and read these files
- Separate entry points for different AIs
- Shared core documentation reduces duplication

### Maintainable
- Single source of truth (nc-ui repo)
- Clear separation: entry files vs. reference docs
- Easy to update when nc-ui changes

## Updating Documentation

When nc-ui is updated:

1. **Update docs in nc-ui repo** (this folder)
2. **Copy updated folder to your projects:**
   ```bash
   cp -r nc-ui/nc-ui-ai-reference /path/to/your-project/docs/nc-ui-ai-reference
   ```
3. **Recommit** to update AI knowledge

## Best Practices

### Do:
- ✅ Copy the entire `nc-ui-ai-reference/` folder to `docs/` in new projects
- ✅ Set up AI-specific entry files (`.github/copilot-instructions.md`, `.claude/project-context.md`)
- ✅ Commit all documentation to version control
- ✅ Update when nc-ui version changes significantly

### Don't:
- ❌ Manually edit these files in individual projects (edit in nc-ui repo, then copy)
- ❌ Delete or modify the folder structure
- ❌ Skip committing to git (AIs need access to these files)

## Troubleshooting

### AI still using native HTML elements?

1. **Check entry files exist:**
   - `.github/copilot-instructions.md` for Copilot
   - `.claude/project-context.md` for Claude

2. **Verify files are committed** to git

3. **Try mentioning nc-ui explicitly:**
   - "Use nc-ui Button component instead of button"
   - "Follow nc-ui conventions from docs/nc-ui-ai-reference/"

4. **Reference specific docs:**
   - "Check docs/nc-ui-ai-reference/components-quick-reference.md for Button API"

### AI not finding documentation?

1. Ensure `nc-ui-ai-reference/` folder is in `docs/` directory
2. Check files are committed and pushed
3. Try referencing files directly in prompts

## Quick Start Example

After setup, tell your AI:

> "I'm using @kingsimba/nc-ui in this project. Please use nc-ui components instead of native HTML elements. Check docs/nc-ui-ai-reference/ for the component API."

The AI should then:
- Use `<Button>` instead of `<button>`
- Use `<Input>` instead of `<input>`
- Use `<ComboBox>` instead of `<select>`
- Follow nc-ui conventions automatically

## Additional Resources

- **Live Demo:** https://kingsimba.github.io/nc-ui/
- **npm Package:** https://www.npmjs.com/package/@kingsimba/nc-ui
- **Source Code:** https://github.com/kingsimba/nc-ui

---

**Questions or Issues?**
If AIs are not following nc-ui conventions after setup, the documentation may need updates. Please open an issue in the nc-ui repository.
