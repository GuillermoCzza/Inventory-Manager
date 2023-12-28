import language from './language.json';

//language change select element
export default function LanguageSelector(lang /*language object*/, setLanguage /*state changing function*/) {
	const handleChange = (event) => {
		const selectedLanguage = event.target.value;
		setLanguage(language[selectedLanguage]);
	}

	return (
		<div id="language-selection">
			<p>{lang.language}</p>
			<select value={lang.code} onChange={handleChange}>
				<option value="en">English</option>
				<option value="es">Español</option>
			</select>
		</div>
	)
}