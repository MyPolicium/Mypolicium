import os
import glob

directory = 'c:/Users/DAVID/OneDrive/Desktop/MYPOLICIUM'
html_files = glob.glob(os.path.join(directory, '*.html'))

old_footer = 'Empowering drivers with clear, unbiased education on auto insurance claims and vehicle valuation.'
new_footer = 'Helping drivers understand auto claims, vehicle value, and insurance decisions before they are under pressure.'

old_faq = "In many situations, yes. The insurer's first offer is an attempt at fair market value, but a valuation can often be reviewed if you have relevant comparables. You can pull comparable listings for identical cars in your area and submit recent maintenance receipts to justify a higher settlement."
new_faq = "In many situations, you may be able to ask your insurer to review a total loss valuation if you have relevant comparables, correct trim details, mileage information, or condition evidence. Actual outcomes can vary depending on the policy, facts, and valuation support."

for file_path in html_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    modified = False
    
    if old_footer in content:
        content = content.replace(old_footer, new_footer)
        modified = True
        
    if old_faq in content:
        content = content.replace(old_faq, new_faq)
        modified = True
        
    if modified:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Updated {os.path.basename(file_path)}')
