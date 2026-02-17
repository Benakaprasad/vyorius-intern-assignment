import { test, expect } from '@playwright/test';

test.describe('Kanban Board — E2E', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  //  Page load 

  test('page loads with correct title', async ({ page }) => {
    await expect(page.getByText('Real-time Kanban Board')).toBeVisible();
  });

  test('all 3 columns are visible', async ({ page }) => {
    await expect(page.getByText('To Do')).toBeVisible();
    await expect(page.getByText('In Progress')).toBeVisible();
    await expect(page.getByText('Done')).toBeVisible();
  });

  //  Task creation

  test('user can add a task', async ({ page }) => {
    await page.getByPlaceholder('Task title').fill('My E2E Task');
    await page.getByText('Add Task').click();
    await expect(page.getByText('My E2E Task')).toBeVisible();
  });

  test('empty title does not create a task', async ({ page }) => {
    const before = await page.locator('[data-testid="task-card"]').count();
    await page.getByText('Add Task').click();
    const after = await page.locator('[data-testid="task-card"]').count();
    expect(after).toBe(before);
  });

  //  Task deletion 

  test('user can delete a task', async ({ page }) => {
    await page.getByPlaceholder('Task title').fill('Delete This');
    await page.getByText('Add Task').click();
    await expect(page.getByText('Delete This')).toBeVisible();
    await page.getByText('Delete').first().click();
    await expect(page.getByText('Delete This')).not.toBeVisible();
  });

  //  Drag and drop 

  test('user can drag task from To Do to In Progress', async ({ page }) => {
    await page.getByPlaceholder('Task title').fill('Drag Task');
    await page.getByText('Add Task').click();
    await page.getByText('Drag Task').waitFor();

    const card   = page.locator('[data-testid="task-card"]').first();
    const target = page.locator('[data-testid="column-inprogress"]');
    await card.dragTo(target);

    await expect(
      page.locator('[data-testid="column-inprogress"] [data-testid="task-card"]').first()
    ).toBeVisible();
  });

  //  Dropdowns 

  test('user can change task priority', async ({ page }) => {
    await page.getByPlaceholder('Task title').fill('Priority Task');
    await page.getByText('Add Task').click();
    await page.getByText('Priority Task').waitFor();

    await page.locator('.priority-select').first().click();
    await page.getByText('High').click();
    await expect(page.getByText('High').first()).toBeVisible();
  });

  test('user can change task category', async ({ page }) => {
    await page.getByPlaceholder('Task title').fill('Category Task');
    await page.getByText('Add Task').click();
    await page.getByText('Category Task').waitFor();

    await page.locator('.category-select').first().click();
    await page.getByText('Bug').click();
    await expect(page.getByText('Bug').first()).toBeVisible();
  });

  //  File upload 

  test('user can upload a valid image file', async ({ page }) => {
    await page.getByPlaceholder('Task title').fill('Upload Task');
    await page.getByText('Add Task').click();
    await page.getByText('Upload Task').waitFor();

    const fileInput = page.locator('[data-testid="file-input"]').first();
    await fileInput.setInputFiles({
      name: 'test.png',
      mimeType: 'image/png',
      buffer: Buffer.from('fake-image-data'),
    });

    await expect(page.getByText('test.png')).toBeVisible();
  });

  test('invalid file type shows error', async ({ page }) => {
    await page.getByPlaceholder('Task title').fill('Bad File Task');
    await page.getByText('Add Task').click();
    await page.getByText('Bad File Task').waitFor();

    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Only JPG, PNG and PDF');
      await dialog.accept();
    });

    const fileInput = page.locator('[data-testid="file-input"]').first();
    await fileInput.setInputFiles({
      name: 'malware.exe',
      mimeType: 'application/x-msdownload',
      buffer: Buffer.from('bad-data'),
    });
  });

  //  Progress chart

  test('progress chart is visible', async ({ page }) => {
    await expect(page.getByTestId('progress-chart')).toBeVisible();
  });

  test('chart updates when task is added', async ({ page }) => {
    const before = await page.getByTestId('progress-chart').textContent();
    await page.getByPlaceholder('Task title').fill('Chart Task');
    await page.getByText('Add Task').click();
    await page.getByText('Chart Task').waitFor();
    const after = await page.getByTestId('progress-chart').textContent();
    expect(after).not.toBe(before);
  });

  test('completion % increases when task moved to Done', async ({ page }) => {
    await page.getByPlaceholder('Task title').fill('Complete Me');
    await page.getByText('Add Task').click();
    await page.getByText('Complete Me').waitFor();

    const before = await page.getByTestId('progress-chart').textContent();

    const card   = page.locator('[data-testid="task-card"]').first();
    const target = page.locator('[data-testid="column-done"]');
    await card.dragTo(target);

    await page.waitForTimeout(500);
    const after = await page.getByTestId('progress-chart').textContent();
    expect(after).not.toBe(before);
  });

});