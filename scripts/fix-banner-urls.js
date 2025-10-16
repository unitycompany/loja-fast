/**
 * Fix banner URLs that incorrectly start with /http or /https
 * Removes the leading slash from external URLs
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file')
  console.error('   Required: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function fixBannerUrls() {
  console.log('🔍 Checking for banners with incorrect URLs...\n')

  try {
    // Fetch all banners
    const { data: banners, error: fetchError } = await supabase
      .from('banners')
      .select('*')

    if (fetchError) {
      console.error('❌ Error fetching banners:', fetchError)
      return
    }

    if (!banners || banners.length === 0) {
      console.log('✅ No banners found in database')
      return
    }

    console.log(`📊 Found ${banners.length} banners total\n`)

    // Find banners with incorrect URLs
    const incorrectBanners = banners.filter(b => 
      b.href && (b.href.startsWith('/http://') || b.href.startsWith('/https://'))
    )

    if (incorrectBanners.length === 0) {
      console.log('✅ All banner URLs are correct!')
      return
    }

    console.log(`🔧 Found ${incorrectBanners.length} banners with incorrect URLs:\n`)

    // Fix each banner
    for (const banner of incorrectBanners) {
      const oldHref = banner.href
      const newHref = oldHref.substring(1) // Remove leading slash

      console.log(`   ID: ${banner.id}`)
      console.log(`   Before: ${oldHref}`)
      console.log(`   After:  ${newHref}`)

      const { error: updateError } = await supabase
        .from('banners')
        .update({ href: newHref })
        .eq('id', banner.id)

      if (updateError) {
        console.error(`   ❌ Error updating banner ${banner.id}:`, updateError)
      } else {
        console.log(`   ✅ Updated successfully\n`)
      }
    }

    console.log('🎉 Done! All banner URLs have been fixed.')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Run the fix
fixBannerUrls()
