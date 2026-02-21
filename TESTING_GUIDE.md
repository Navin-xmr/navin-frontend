# Core Features Section - Testing Guide

## Prerequisites

Before testing, ensure you have:
- Node.js v18 or later installed
- npm (comes with Node.js)
- A modern web browser (Chrome, Firefox, Safari, or Edge)

## Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

This will install all required packages including:
- React 19
- TypeScript
- Vite
- Vitest
- Testing Library
- ESLint

## Running the Development Server

Start the local development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### What to Look For

1. **Hero Section** - Should load first with starfield animation
2. **Core Features Section** - Scroll down to see it
3. **Scroll Animations** - Watch blocks fade in and slide up as you scroll
4. **Responsive Layout** - Resize browser to test mobile/tablet views

## Running Tests

### Run All Tests Once
```bash
npm run test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Expected Test Results

All tests should pass:
```
✓ CoreFeatures > renders the section title and subtitle
✓ CoreFeatures > renders all four feature blocks
✓ CoreFeatures > renders feature descriptions
✓ CoreFeatures > renders bullet points for each feature
✓ CoreFeatures > renders images with proper alt text
✓ CoreFeatures > applies correct CSS classes for zigzag layout
```

## Running the Linter

Check for code quality issues:

```bash
npm run lint
```

Expected output: No errors or warnings

## Building for Production

Test the production build:

```bash
npm run build
```

This will:
1. Run TypeScript type checking
2. Build optimized production bundle
3. Output to `frontend/dist/` directory

Expected output: Build completed successfully with no errors

## Manual Testing Checklist

### Desktop View (>900px width)

- [ ] Section title "Core Features" is visible and properly styled
- [ ] Subtitle is centered and readable
- [ ] All 4 feature blocks are displayed
- [ ] Feature 1 has image on LEFT, content on RIGHT
- [ ] Feature 2 has content on LEFT, image on RIGHT
- [ ] Feature 3 has image on LEFT, content on RIGHT
- [ ] Feature 4 has content on LEFT, image on RIGHT
- [ ] All images load correctly
- [ ] Scroll animations trigger when blocks enter viewport
- [ ] Blocks fade in and slide up smoothly
- [ ] Bullet points have checkmark icons
- [ ] Text is readable with good contrast
- [ ] Glassmorphism effect visible on blocks

### Tablet View (768px - 900px)

- [ ] Layout remains 2-column but with reduced spacing
- [ ] Zigzag pattern still works
- [ ] Text remains readable
- [ ] Images scale appropriately

### Mobile View (<768px)

- [ ] All blocks stack vertically
- [ ] Image appears ABOVE content for all blocks
- [ ] Text is readable without horizontal scrolling
- [ ] Spacing is appropriate for mobile
- [ ] Touch targets are large enough
- [ ] Animations still work smoothly

### Accessibility Testing

- [ ] Tab through the page - focus indicators visible
- [ ] Screen reader announces section title
- [ ] Images have descriptive alt text
- [ ] Heading hierarchy is correct (h2 → h3)
- [ ] Color contrast meets WCAG AA standards
- [ ] No keyboard traps

### Performance Testing

- [ ] Page loads quickly
- [ ] Animations are smooth (60fps)
- [ ] No layout shifts during load
- [ ] Images lazy load as you scroll
- [ ] No console errors or warnings

## Browser Compatibility Testing

Test in multiple browsers:

### Chrome/Edge (Chromium)
```bash
# Should work perfectly
npm run dev
# Open http://localhost:5173
```

### Firefox
```bash
# Should work perfectly
npm run dev
# Open http://localhost:5173
```

### Safari
```bash
# Should work perfectly
npm run dev
# Open http://localhost:5173
```

## Troubleshooting

### Issue: npm commands not working
**Solution**: Check PowerShell execution policy on Windows
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Issue: Dependencies not installing
**Solution**: Clear npm cache and retry
```bash
npm cache clean --force
npm install
```

### Issue: Port 5173 already in use
**Solution**: Kill the process or use a different port
```bash
# Kill process on port 5173 (Windows)
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Or specify a different port
npm run dev -- --port 3000
```

### Issue: TypeScript errors
**Solution**: Check TypeScript version and configuration
```bash
npx tsc --version
npx tsc --noEmit
```

### Issue: Images not loading
**Solution**: Verify image paths are correct
- Images should be in `frontend/public/images/core-features/`
- Paths in code should start with `/images/core-features/`

### Issue: Animations not working
**Solution**: Check browser support for IntersectionObserver
- Open browser console
- Type: `'IntersectionObserver' in window`
- Should return `true`

### Issue: Styles not applying
**Solution**: Check CSS import in component
```typescript
// CoreFeatures.tsx should have:
import './CoreFeatures.css';
```

## Performance Benchmarks

Expected performance metrics:

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.5s
- **Cumulative Layout Shift**: < 0.1
- **Animation Frame Rate**: 60fps

## Testing with Different Screen Sizes

### Using Browser DevTools

1. Open DevTools (F12)
2. Click device toolbar icon (Ctrl+Shift+M)
3. Test these presets:
   - iPhone SE (375px)
   - iPhone 12 Pro (390px)
   - iPad (768px)
   - iPad Pro (1024px)
   - Desktop (1920px)

### Using Responsive Design Mode

1. Right-click page → Inspect
2. Click responsive design mode
3. Drag to resize viewport
4. Watch layout adapt at breakpoints

## Automated Testing Commands

### Run all checks at once
```bash
# Type check
npm run build

# Lint
npm run lint

# Test
npm run test
```

### CI/CD Simulation
```bash
# Simulate what CI would run
npm ci
npm run lint
npm run test
npm run build
```

## Visual Regression Testing (Optional)

If you want to capture screenshots for comparison:

1. Install a screenshot tool
2. Capture at different breakpoints
3. Compare before/after changes

## Reporting Issues

If you find bugs, report with:

1. **Browser**: Chrome 120, Firefox 121, etc.
2. **Screen Size**: 1920x1080, iPhone 12, etc.
3. **Steps to Reproduce**: Detailed steps
4. **Expected Behavior**: What should happen
5. **Actual Behavior**: What actually happens
6. **Screenshots**: Visual evidence
7. **Console Errors**: Any error messages

## Success Criteria

The implementation is successful when:

✅ All automated tests pass  
✅ No TypeScript errors  
✅ No linting errors  
✅ Production build succeeds  
✅ All 4 features display correctly  
✅ Zigzag layout works on desktop  
✅ Stacked layout works on mobile  
✅ Scroll animations trigger smoothly  
✅ Images load and display properly  
✅ Text is readable and accessible  
✅ No console errors or warnings  
✅ Performance is acceptable  

## Next Steps After Testing

Once testing is complete:

1. Take screenshots of desktop and mobile views
2. Record a short video showing scroll animations
3. Document any issues found
4. Create a pull request with:
   - Description of changes
   - Screenshots/video
   - Test results
   - Any known issues

## Additional Resources

- [React Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
- [Vitest Documentation](https://vitest.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [MDN Web Docs - IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [WCAG Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Happy Testing!** 🚀
