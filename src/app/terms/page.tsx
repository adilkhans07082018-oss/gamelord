import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | GameLord',
  description: 'Terms of Service for GameLord.',
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] font-sans pb-20 pt-24 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-8">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8">Terms of Service</h1>
        
        <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 space-y-6">
          <p><em>Last Updated: {new Date().toLocaleDateString()}</em></p>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing and using GameLord ("the Website", "we", "us", or "our"), you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our website.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">2. Nature of the Website</h2>
          <p>
            GameLord is an indexing and directory service. <strong>We do not host, upload, or store any game files, software, or copyrighted material on our servers.</strong> All content provided on the Website is sourced from third-party websites across the internet. We only provide links and metadata (such as titles, descriptions, and images) for informational purposes.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">3. Third-Party Links</h2>
          <p>
            Our website contains links to third-party web sites or services that are not owned or controlled by GameLord. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services. You acknowledge and agree that GameLord shall not be responsible or liable, directly or indirectly, for any damage or loss caused by or in connection with the use of any such content, goods, or services available on or through any such websites.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">4. Acceptable Use</h2>
          <p>
            You agree not to use the Website in any way that causes, or may cause, damage to the Website or impairment of the availability or accessibility of the Website. You must not use the Website in any way which is unlawful, illegal, fraudulent, or harmful.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">5. Disclaimer of Warranties</h2>
          <p>
            The Website is provided "as is," with all faults, and GameLord makes no express or implied representations or warranties of any kind related to this Website or the materials contained on this Website. We do not guarantee that the files downloaded from third-party links will be free of viruses or malware, and you assume all risks associated with downloading such files.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">6. Limitation of Liability</h2>
          <p>
            In no event shall GameLord, nor any of its officers, directors, and employees, be liable for anything arising out of or in any way connected with your use of this Website. GameLord shall not be liable for any indirect, consequential, or special liability arising out of or in any way related to your use of this Website.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">7. Advertising</h2>
          <p>
            The Website utilizes third-party advertising networks to serve ads. These networks may use cookies and web beacons to collect non-personal information about your visits to provide relevant advertisements. By using the Website, you consent to the placement of these ads.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4">8. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. We do so by posting and drawing attention to the updated terms on the Site. Your decision to continue to visit and make use of the Site after such changes have been made constitutes your formal acceptance of the new Terms of Service.
          </p>
        </div>
      </div>
    </div>
  );
}
