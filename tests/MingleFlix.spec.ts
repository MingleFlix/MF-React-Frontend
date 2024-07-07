import { test, expect } from '@playwright/test';

/*
 * Author: Alexandre Kaul
 * Matrikelnummer: 2552912
 */

test('End-to-End Test', async ({ page }) => {
  // Register
  await page.goto('http://localhost:5173/');
  await expect(page.getByRole('link', { name: 'Register' })).toBeVisible();
  await page.getByRole('link', { name: 'Register' }).click();
  await expect(page.locator('h2')).toContainText('Register');
  await expect(page.getByRole('button', { name: 'Register' })).toBeVisible();
  await expect(page.getByPlaceholder('Username')).toBeVisible();
  await expect(page.getByPlaceholder('Email address')).toBeVisible();
  await expect(page.getByPlaceholder('Password')).toBeVisible();
  await page.getByPlaceholder('Username').click();
  await page.getByPlaceholder('Username').fill('test');
  await page.getByPlaceholder('Email address').click();
  await page.getByPlaceholder('Email address').fill('test@test.com');
  await page.getByPlaceholder('Password').click();
  await page.getByPlaceholder('Password').fill('test1234');
  await page.getByRole('button', { name: 'Register' }).click();
  await expect(
    page.getByRole('link', { name: 'Successfully registered. You' }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Already registered?' }),
  ).toBeVisible();

  // Login
  await page.getByRole('link', { name: 'Already registered?' }).click();
  await expect(page.locator('h2')).toContainText('Login');
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  await expect(page.getByPlaceholder('Email address')).toBeVisible();
  await expect(page.getByPlaceholder('Password')).toBeVisible();
  await page.getByPlaceholder('Email address').click();
  await page.getByPlaceholder('Email address').fill('test@test.com');
  await page.getByPlaceholder('Password').click();
  await page.getByPlaceholder('Password').fill('test');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByText('Login successful!')).toBeVisible();

  // Create Room
  await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
  await page.getByRole('link', { name: 'Home' }).click();
  await expect(page.getByRole('button', { name: 'Get Started' })).toBeVisible();
  await page.getByRole('button', { name: 'Get Started' }).click();
  await expect(page.locator('h3')).toContainText('Create Room');
  await expect(page.getByPlaceholder('Name of your room')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Create' })).toBeVisible();
  await page.getByPlaceholder('Name of your room').click();
  await page.getByPlaceholder('Name of your room').fill('test-room');
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.locator('#room-page')).toContainText('Room: test-room');

  // Play Video
  await expect(page.locator('.plyr__poster')).toBeVisible();
  await expect(page.getByLabel('Play')).toBeVisible();
  await page.getByLabel('Play').click();
  await expect(page.getByLabel('Pause')).toBeVisible();
  await page.getByLabel('Pause').click();

  // Add Video to Queue
  await expect(page.getByPlaceholder('Add Video URL')).toBeVisible();
  await expect(page.getByText('Queue')).toBeVisible();
  await page.getByPlaceholder('Add Video URL').click();
  await page
    .getByPlaceholder('Add Video URL')
    .fill(
      'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    );
  await page.getByPlaceholder('Add Video URL').press('Enter');
  await expect(
    page.getByRole('link', { name: '⮞ http://commondatastorage.' }),
  ).toBeVisible();

  // Play Video from Queue
  await page.getByRole('link', { name: '⮞ http://commondatastorage.' }).click();
  await page.getByLabel('Play').click();
});
