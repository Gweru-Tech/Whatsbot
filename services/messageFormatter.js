/**
 * Message Formatter Service
 * Converts messages to iOS-style formatting
 */

class MessageFormatter {
    /**
     * Convert text to iOS style
     * @param {string} text - Original message text
     * @returns {string} - iOS styled text
     */
    convertToIOSStyle(text) {
        let styledText = text;

        // iOS uses specific Unicode characters for styling
        // Convert bold (WhatsApp uses *text*) to iOS bold
        styledText = this.convertBold(styledText);
        
        // Convert italic (WhatsApp uses _text_) to iOS italic
        styledText = this.convertItalic(styledText);
        
        // Convert strikethrough (WhatsApp uses ~text~) to iOS strikethrough
        styledText = this.convertStrikethrough(styledText);
        
        // Convert monospace (WhatsApp uses ```text```) to iOS monospace
        styledText = this.convertMonospace(styledText);
        
        // Add iOS-style quotation marks
        styledText = this.convertQuotes(styledText);
        
        // Add iOS-style emoji spacing
        styledText = this.improveEmojiSpacing(styledText);

        return styledText;
    }

    /**
     * Convert bold formatting
     */
    convertBold(text) {
        // WhatsApp bold: *text*
        // iOS uses Unicode bold characters
        return text.replace(/\*([^*]+)\*/g, (match, content) => {
            return this.toBoldUnicode(content);
        });
    }

    /**
     * Convert italic formatting
     */
    convertItalic(text) {
        // WhatsApp italic: _text_
        return text.replace(/_([^_]+)_/g, (match, content) => {
            return this.toItalicUnicode(content);
        });
    }

    /**
     * Convert strikethrough formatting
     */
    convertStrikethrough(text) {
        // WhatsApp strikethrough: ~text~
        return text.replace(/~([^~]+)~/g, (match, content) => {
            return this.toStrikethroughUnicode(content);
        });
    }

    /**
     * Convert monospace formatting
     */
    convertMonospace(text) {
        // WhatsApp monospace: ```text```
        return text.replace(/```([^`]+)```/g, (match, content) => {
            return this.toMonospaceUnicode(content);
        });
    }

    /**
     * Convert to iOS-style quotes
     */
    convertQuotes(text) {
        // Replace straight quotes with curly quotes (iOS style)
        text = text.replace(/"([^"]+)"/g, '"$1"');
        text = text.replace(/'([^']+)'/g, ''$1'');
        return text;
    }

    /**
     * Improve emoji spacing (iOS adds subtle spacing)
     */
    improveEmojiSpacing(text) {
        // Add zero-width space after emojis for better iOS-like rendering
        const emojiRegex = /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/gu;
        return text.replace(emojiRegex, '$1\u200B');
    }

    /**
     * Convert text to Unicode bold
     */
    toBoldUnicode(text) {
        const boldMap = {
            'A': '𝗔', 'B': '𝗕', 'C': '𝗖', 'D': '𝗗', 'E': '𝗘', 'F': '𝗙', 'G': '𝗚',
            'H': '𝗛', 'I': '𝗜', 'J': '𝗝', 'K': '𝗞', 'L': '𝗟', 'M': '𝗠', 'N': '𝗡',
            'O': '𝗢', 'P': '𝗣', 'Q': '𝗤', 'R': '𝗥', 'S': '𝗦', 'T': '𝗧', 'U': '𝗨',
            'V': '𝗩', 'W': '𝗪', 'X': '𝗫', 'Y': '𝗬', 'Z': '𝗭',
            'a': '𝗮', 'b': '𝗯', 'c': '𝗰', 'd': '𝗱', 'e': '𝗲', 'f': '𝗳', 'g': '𝗴',
            'h': '𝗵', 'i': '𝗶', 'j': '𝗷', 'k': '𝗸', 'l': '𝗹', 'm': '𝗺', 'n': '𝗻',
            'o': '𝗼', 'p': '𝗽', 'q': '𝗾', 'r': '𝗿', 's': '𝘀', 't': '𝘁', 'u': '𝘂',
            'v': '𝘃', 'w': '𝘄', 'x': '𝘅', 'y': '𝘆', 'z': '𝘇',
            '0': '𝟬', '1': '𝟭', '2': '𝟮', '3': '𝟯', '4': '𝟰',
            '5': '𝟱', '6': '𝟲', '7': '𝟳', '8': '𝟴', '9': '𝟵'
        };
        
        return text.split('').map(char => boldMap[char] || char).join('');
    }

    /**
     * Convert text to Unicode italic
     */
    toItalicUnicode(text) {
        const italicMap = {
            'A': '𝘈', 'B': '𝘉', 'C': '𝘊', 'D': '𝘋', 'E': '𝘌', 'F': '𝘍', 'G': '𝘎',
            'H': '𝘏', 'I': '𝘐', 'J': '𝘑', 'K': '𝘒', 'L': '𝘓', 'M': '𝘔', 'N': '𝘕',
            'O': '𝘖', 'P': '𝘗', 'Q': '𝘘', 'R': '𝘙', 'S': '𝘚', 'T': '𝘛', 'U': '𝘜',
            'V': '𝘝', 'W': '𝘞', 'X': '𝘟', 'Y': '𝘠', 'Z': '𝘡',
            'a': '𝘢', 'b': '𝘣', 'c': '𝘤', 'd': '𝘥', 'e': '𝘦', 'f': '𝘧', 'g': '𝘨',
            'h': '𝘩', 'i': '𝘪', 'j': '𝘫', 'k': '𝘬', 'l': '𝘭', 'm': '𝘮', 'n': '𝘯',
            'o': '𝘰', 'p': '𝘱', 'q': '𝘲', 'r': '𝘳', 's': '𝘴', 't': '𝘵', 'u': '𝘶',
            'v': '𝘷', 'w': '𝘸', 'x': '𝘹', 'y': '𝘺', 'z': '𝘻'
        };
        
        return text.split('').map(char => italicMap[char] || char).join('');
    }

    /**
     * Convert text to Unicode strikethrough
     */
    toStrikethroughUnicode(text) {
        // Add combining strikethrough character to each character
        return text.split('').map(char => char + '\u0336').join('');
    }

    /**
     * Convert text to Unicode monospace
     */
    toMonospaceUnicode(text) {
        const monospaceMap = {
            'A': '𝙰', 'B': '𝙱', 'C': '𝙲', 'D': '𝙳', 'E': '𝙴', 'F': '𝙵', 'G': '𝙶',
            'H': '𝙷', 'I': '𝙸', 'J': '𝙹', 'K': '𝙺', 'L': '𝙻', 'M': '𝙼', 'N': '𝙽',
            'O': '𝙾', 'P': '𝙿', 'Q': '𝚀', 'R': '𝚁', 'S': '𝚂', 'T': '𝚃', 'U': '𝚄',
            'V': '𝚅', 'W': '𝚆', 'X': '𝚇', 'Y': '𝚈', 'Z': '𝚉',
            'a': '𝚊', 'b': '𝚋', 'c': '𝚌', 'd': '𝚍', 'e': '𝚎', 'f': '𝚏', 'g': '𝚐',
            'h': '𝚑', 'i': '𝚒', 'j': '𝚓', 'k': '𝚔', 'l': '𝚕', 'm': '𝚖', 'n': '𝚗',
            'o': '𝚘', 'p': '𝚙', 'q': '𝚚', 'r': '𝚛', 's': '𝚜', 't': '𝚝', 'u': '𝚞',
            'v': '𝚟', 'w': '𝚠', 'x': '𝚡', 'y': '𝚢', 'z': '𝚣',
            '0': '𝟶', '1': '𝟷', '2': '𝟸', '3': '𝟹', '4': '𝟺',
            '5': '𝟻', '6': '𝟼', '7': '𝟽', '8': '𝟾', '9': '𝟿'
        };
        
        return text.split('').map(char => monospaceMap[char] || char).join('');
    }
}

module.exports = new MessageFormatter();
