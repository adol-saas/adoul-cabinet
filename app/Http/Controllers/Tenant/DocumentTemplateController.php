<?php

declare(strict_types=1);

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\DocumentTemplate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use ZipArchive;

class DocumentTemplateController extends Controller
{
    public function index(): Response
    {
        $templates = DocumentTemplate::orderBy('name_ar')->get();

        return Inertia::render('tenant/templates/index', [
            'templates' => $templates,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name_ar' => ['required', 'string', 'max:255'],
            'name_fr' => ['nullable', 'string', 'max:255'],
            'type' => ['required', 'string', 'max:50'],
            'content_ar' => ['required', 'string'],
            'content_fr' => ['nullable', 'string'],
            'content_ber' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ]);

        $template = DocumentTemplate::create([
            'name_ar' => trim($validated['name_ar']),
            'name_fr' => ! empty($validated['name_fr']) ? trim($validated['name_fr']) : trim($validated['name_ar']),
            'type' => trim($validated['type']),
            'content_ar' => $validated['content_ar'],
            'content_fr' => $validated['content_fr'] ?? '',
            'content_ber' => $validated['content_ber'] ?? '',
            'is_active' => $validated['is_active'] ?? true,
            'version' => 1,
        ]);

        return back()->with('success', "تمت إضافة نموذج العقد الجديد [{$template->name_ar}] بنجاح.");
    }

    public function update(Request $request, DocumentTemplate $template): RedirectResponse
    {
        $validated = $request->validate([
            'name_ar' => ['required', 'string', 'max:255'],
            'name_fr' => ['nullable', 'string', 'max:255'],
            'type' => ['nullable', 'string', 'max:50'],
            'content_ar' => ['required', 'string'],
            'content_fr' => ['nullable', 'string'],
            'content_ber' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ]);

        $template->update([
            'name_ar' => trim($validated['name_ar']),
            'name_fr' => ! empty($validated['name_fr']) ? trim($validated['name_fr']) : $template->name_fr,
            'type' => ! empty($validated['type']) ? trim($validated['type']) : $template->type,
            'content_ar' => $validated['content_ar'],
            'content_fr' => $validated['content_fr'] ?? '',
            'content_ber' => $validated['content_ber'] ?? '',
            'is_active' => $validated['is_active'] ?? true,
            'version' => $template->version + 1,
        ]);

        return back()->with('success', "تم تحديث نموذج [{$template->name_ar}] وحفظ الإصدار رقم {$template->version}.");
    }

    public function destroy(DocumentTemplate $template): RedirectResponse
    {
        $name = $template->name_ar;
        $template->delete();

        return back()->with('success', "تم حذف نموذج العقد [{$name}] بنجاح.");
    }

    public function parseWord(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'max:15360'],
        ]);

        $file = $request->file('file');
        $extension = strtolower($file->getClientOriginalExtension());
        $extractedText = '';

        if ($extension === 'docx') {
            $zip = new ZipArchive();
            if ($zip->open($file->getRealPath()) === true) {
                if (($xmlIndex = $zip->locateName('word/document.xml')) !== false) {
                    $xmlData = $zip->getFromIndex($xmlIndex);
                    $paragraphs = [];
                    if (preg_match_all('/<w:p(?: [^>]*)?>(.*?)<\/w:p>/is', $xmlData, $pMatches)) {
                        foreach ($pMatches[1] as $pXml) {
                            if (preg_match_all('/<w:t(?: [^>]*)?>(.*?)<\/w:t>/is', $pXml, $tMatches)) {
                                $pText = implode('', $tMatches[1]);
                                if (trim($pText) !== '') {
                                    $paragraphs[] = html_entity_decode(trim($pText), ENT_QUOTES | ENT_XML1, 'UTF-8');
                                }
                            }
                        }
                    }
                    $extractedText = implode("\n\n", $paragraphs);
                }
                $zip->close();
            }
        } elseif ($extension === 'txt') {
            $extractedText = file_get_contents($file->getRealPath()) ?: '';
        }

        if (empty($extractedText)) {
            return response()->json([
                'success' => false,
                'message' => 'تعذر استخراج النص من الملف. يرجى التأكد من أن الملف بصيغة Word (.docx) صالحة ويحتوي على نص.',
            ], 422);
        }

        $filename = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);

        return response()->json([
            'success' => true,
            'title' => $filename,
            'content' => $extractedText,
            'filename' => $file->getClientOriginalName(),
        ]);
    }
}
